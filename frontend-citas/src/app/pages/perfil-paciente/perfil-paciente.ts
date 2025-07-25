import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface PerfilData {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  telefono?: string;
}

interface CitaPaciente {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  medico: string;
  especialidad: string;
}

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './perfil-paciente.html',
  styleUrls: ['./perfil-paciente.css']
})
export class PerfilPaciente implements OnInit {

  perfil: PerfilData | null = null;
  citas: CitaPaciente[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarCitas();
  }

  private authHeaders() {
    const token = localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${token}` };
  }

  cargarPerfil() {
    this.http.get<PerfilData>('/api/paciente/perfil/', { headers: this.authHeaders() })
      .subscribe({
        next: data => this.perfil = data,
        error: err => console.error('Error cargando perfil:', err)
      });
  }

  cargarCitas() {
    this.http.get<CitaPaciente[]>('/api/paciente/citas/', { headers: this.authHeaders() })
      .subscribe({
        next: data => this.citas = data,
        error: err => console.error('Error cargando citas:', err)
      });
  }
}