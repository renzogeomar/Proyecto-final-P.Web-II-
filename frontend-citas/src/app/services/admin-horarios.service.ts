import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

export interface HorarioAdmin {
  id: number;
  medico: number;
  fecha: string;      // YYYY-MM-DD
  hora: string;       // HH:MM[:SS]
  disponible: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminHorariosService {
  private baseUrl = '/api/admin';

  constructor(private http: HttpClient, private auth: Auth) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.obtenerToken() || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /** Lista horarios de un médico. */
  listar(medicoId: number): Observable<HorarioAdmin[]> {
    return this.http.get<HorarioAdmin[]>(
      `${this.baseUrl}/medicos/${medicoId}/horarios/`,
      { headers: this.authHeaders() }
    );
  }

  /** Crea horario para un médico. */
  crear(medicoId: number, data: { fecha: string; hora: string; disponible: boolean }): Observable<HorarioAdmin> {
    return this.http.post<HorarioAdmin>(
      `${this.baseUrl}/medicos/${medicoId}/horarios/`,
      data,
      { headers: this.authHeaders() }
    );
  }

  /** Actualiza horario existente. */
  actualizar(horarioId: number, data: Partial<HorarioAdmin>): Observable<HorarioAdmin> {
    return this.http.put<HorarioAdmin>(
      `${this.baseUrl}/horarios/${horarioId}/`,
      data,
      { headers: this.authHeaders() }
    );
  }

  /** Elimina horario. */
  eliminar(horarioId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/horarios/${horarioId}/`,
      { headers: this.authHeaders() }
    );
  }
}