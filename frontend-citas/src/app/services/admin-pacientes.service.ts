import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface PacienteAdmin {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminPacientesService {
  private baseUrl = '/api/admin/pacientes/';

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${token}` };
  }

  listar(q: string = '') {
    const url = q ? `${this.baseUrl}?q=${encodeURIComponent(q)}` : this.baseUrl;
    return this.http.get<PacienteAdmin[]>(url, { headers: this.authHeaders() });
  }

  crear(data: { username: string; email?: string; first_name?: string; last_name?: string; telefono?: string; password?: string; }) {
    return this.http.post<PacienteAdmin>(this.baseUrl, data, { headers: this.authHeaders() });
  }

  obtener(id: number) {
    return this.http.get<PacienteAdmin>(`${this.baseUrl}${id}/`, { headers: this.authHeaders() });
  }

  actualizar(id: number, data: Partial<PacienteAdmin>) {
    return this.http.patch<PacienteAdmin>(`${this.baseUrl}${id}/`, data, { headers: this.authHeaders() });
  }

  eliminar(id: number) {
    return this.http.delete(`${this.baseUrl}${id}/`, { headers: this.authHeaders() });
  }
}