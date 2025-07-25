import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicoAdmin {
  id: number;
  nombres: string;
  correo: string;
  especialidad: number; // id
}

@Injectable({ providedIn: 'root' })
export class AdminMedicosService {
  private baseUrl = '/api/admin/medicos/';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  listar(q: string = ''): Observable<MedicoAdmin[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<MedicoAdmin[]>(this.baseUrl, {
      headers: this.authHeaders(),
      params
    });
  }

  crear(data: { nombres: string; correo: string; especialidad: number }): Observable<MedicoAdmin> {
    return this.http.post<MedicoAdmin>(this.baseUrl, data, {
      headers: this.authHeaders()
    });
  }

  actualizar(id: number, data: { nombres: string; correo: string; especialidad: number }): Observable<MedicoAdmin> {
    return this.http.put<MedicoAdmin>(`${this.baseUrl}${id}/`, data, {
      headers: this.authHeaders()
    });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${id}/`, {
      headers: this.authHeaders()
    });
  }
}