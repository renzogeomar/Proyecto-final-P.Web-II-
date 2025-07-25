import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-panel-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './panel-paciente.html',
  styleUrls: ['./panel-paciente.css']
})
export class PanelPaciente implements OnInit {

  especialidades: any[] = [];
  medicos: any[] = [];
  horarios: any[] = [];

  // Campos de formulario
  especialidadSeleccionada = '';
  medicoSeleccionado = '';
  horarioSeleccionado = '';

  mensaje = '';
  exito = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades() {
    this.http.get('/api/especialidades/').subscribe({
      next: (data: any) => this.especialidades = data,
      error: err => console.error('Error cargando especialidades:', err)
    });
  }

  onEspecialidadChange(event: Event) {
    const espId = (event.target as HTMLSelectElement).value;
    this.especialidadSeleccionada = espId;
    this.medicoSeleccionado = '';
    this.horarios = [];
    this.medicos = [];

    if (!espId) return;

    this.http.get(`/api/medicos/?especialidad=${espId}`).subscribe({
      next: (data: any) => this.medicos = data,
      error: err => console.error('Error cargando médicos:', err)
    });
  }

  onMedicoChange(event: Event) {
    const medicoId = (event.target as HTMLSelectElement).value;
    this.medicoSeleccionado = medicoId;
    this.horarioSeleccionado = '';
    this.horarios = [];

    if (!medicoId) return;

    this.http.get(`/api/horarios/?medico=${medicoId}`).subscribe({
      next: (data: any) => this.horarios = data,
      error: err => console.error('Error cargando horarios:', err)
    });
  }

  reservarCita() {
    if (!this.medicoSeleccionado || !this.horarioSeleccionado) {
      this.mensaje = 'Debe seleccionar médico y horario.';
      this.exito = false;
      return;
    }

    const [fecha, hora] = this.horarioSeleccionado.split(' ');

    const body = {
      medico: this.medicoSeleccionado,
      fecha: fecha,
      hora: hora,
    };

    const token = localStorage.getItem('token') || '';
    console.log('Token enviado:', token);

    this.http.post('/api/citas/reservar/', body, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.mensaje = res.message || 'Cita reservada con éxito.';
        this.exito = true;
        // Opcional: reset de campos
        // this.medicoSeleccionado = ''; this.fecha=''; this.hora='';
      },
      error: (err) => {
        console.error('Error reservar cita:', err);
        this.mensaje = err?.error?.error || 'Error al reservar la cita.';
        this.exito = false;
      }
    });
  }
}