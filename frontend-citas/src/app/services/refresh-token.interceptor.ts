import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from './auth';
import { Router } from '@angular/router';
import {
  HttpClient,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export const refreshTokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const auth = inject(Auth);
  const http = inject(HttpClient);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isExpired = error.status === 401 &&
        error.error?.code === 'token_not_valid' &&
        error.error?.messages?.some((m: any) => m.message === 'Token is expired');

      if (!isExpired) {
        return throwError(() => error);
      }

      const refresh = auth.obtenerRefreshToken();
      if (!refresh) {
        auth.cerrarSesion();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      return http.post<{ access: string }>(
        '/api/token/refresh/',
        { refresh },
        { withCredentials: true }
      ).pipe(
        switchMap(response => {
          // Guarda el nuevo token
          auth.guardarToken(response.access, refresh, auth.obtenerNombreUsuario()!);

          // Reintenta la solicitud original con el nuevo token
          const newReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.access}`
            },
            withCredentials: true
          });

          return next(newReq);
        }),
        catchError(err => {
          auth.cerrarSesion();
          router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    })
  );
};