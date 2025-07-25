import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

/** Especialidad médica. */
export interface Especialidad {
  id: number;
  nombre: string;
}

export interface EspecialidadConMedicos extends Especialidad {
  medicos: {
    id: number;
    nombres: string;
    correo: string;
    especialidad: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private baseUrl = '/api';  // relativo: funciona en Django embed y en dev proxy

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  // ---------------------------------------------------------------------------
  // PARTE PÚBLICA (Pacientes, visitas)
  // ---------------------------------------------------------------------------

  /** Lista todas las especialidades (public). */
  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.baseUrl}/especialidades/`);
  }

  /** Alias retrocompatible para código existente. */
  getEspecialidades(): Observable<Especialidad[]> {
    return this.listar();
  }

  /**
   * Lista médicos por especialidad (public).
   * GET /api/medicos/?especialidad=<id>
   */
  getMedicosPorEspecialidad(id: number): Observable<any[]> {
    const params = new HttpParams().set('especialidad', id);
    return this.http.get<any[]>(`${this.baseUrl}/medicos/`, { params });
  }

  // ---------------------------------------------------------------------------
  // PARTE ADMIN (CRUD) - requiere token
  // ---------------------------------------------------------------------------

  private authHeaders(): HttpHeaders {
    const token = this.auth.obtenerToken() || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  crearEspecialidad(nombre: string): Observable<Especialidad> {
    return this.http.post<Especialidad>(
      `${this.baseUrl}/especialidades/crear/`,
      { nombre },
      { headers: this.authHeaders() }
    );
  }

  editarEspecialidad(id: number, nombre: string): Observable<Especialidad> {
    return this.http.put<Especialidad>(
      `${this.baseUrl}/especialidades/${id}/editar/`,
      { nombre },
      { headers: this.authHeaders() }
    );
  }

  eliminarEspecialidad(id: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/especialidades/${id}/eliminar/`,
      { headers: this.authHeaders() }
    );
  }

  getEspecialidadesConMedicos(): Observable<EspecialidadConMedicos[]> {
    return this.http.get<EspecialidadConMedicos[]>(`${this.baseUrl}/especialidades-con-medicos/`);
  }
}