import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsrfInterceptor implements HttpInterceptor {

  private getToken(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.getToken();

    if (token && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
      req = req.clone({
        withCredentials: true,
        setHeaders: {
          'X-CSRFToken': token
        }
      });
    }

    return next.handle(req);
  }
}