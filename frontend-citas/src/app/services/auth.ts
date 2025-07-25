import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // --- Auth ---
  login(credentials: { username: string; password: string }): Observable<any> {
    // TokenObtainPairView -> access, refresh
    return this.http.post<{ access: string; refresh: string }>(
      `${this.apiUrl}/login/`,
      credentials
    ).pipe(
      tap(response => {
        this.guardarToken(response.access, response.refresh, credentials.username);
      }),
      // tras guardar token, pedimos el rol y lo guardamos
      switchMap(() => this.obtenerRol().pipe(
        tap(resp => localStorage.setItem('rol', resp.rol)),
      ))
    );
  }

  register(data: { username: string; password: string; email: string }) {
    return this.http.post(`${this.apiUrl}/register/`, data, {
      withCredentials: true
    });
  }

  guardarToken(access: string, refresh: string, username: string) {
    localStorage.setItem('token', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('username', username);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }
  obtenerRefreshToken(): string | null {
    return localStorage.getItem('refresh');
  }
  obtenerNombreUsuario(): string | null {
    return localStorage.getItem('username');
  }
  obtenerRol(): Observable<{ rol: string }> {
    const headers = this.authHeaders();
    return this.http.get<{ rol: string }>(`${this.apiUrl}/rol/`, { headers });
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  private authHeaders(): HttpHeaders {
    const token = this.obtenerToken() || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}