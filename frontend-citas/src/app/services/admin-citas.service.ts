import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

export interface CitaAdmin {
  id: number;
  paciente: number;              // id Paciente
  paciente_username: string;
  paciente_nombre: string;
  medico: number;                // id Medico
  medico_nombre: string;
  especialidad_nombre: string;
  fecha: string;                 // YYYY-MM-DD
  hora: string;                  // HH:MM[:SS]
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class AdminCitasService {
  private baseUrl = '/api/admin/citas/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  private headers(): HttpHeaders {
    const token = this.auth.obtenerToken() || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  listar(q: string = ''): Observable<CitaAdmin[]> {
    const params = q ? new HttpParams().set('q', q) : undefined;
    return this.http.get<CitaAdmin[]>(this.baseUrl, {
      headers: this.headers(),
      params
    });
  }

  crear(data: Partial<CitaAdmin>): Observable<CitaAdmin> {
    return this.http.post<CitaAdmin>(this.baseUrl, data, {
      headers: this.headers()
    });
  }

  actualizar(id: number, data: Partial<CitaAdmin>): Observable<CitaAdmin> {
    return this.http.put<CitaAdmin>(`${this.baseUrl}${id}/`, data, {
      headers: this.headers()
    });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${id}/`, {
      headers: this.headers()
    });
  }

  obtener(id: number): Observable<CitaAdmin> {
    return this.http.get<CitaAdmin>(`${this.baseUrl}${id}/`, {
      headers: this.headers()
    });
  }
}
