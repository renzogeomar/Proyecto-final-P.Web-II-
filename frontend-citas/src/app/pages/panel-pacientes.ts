import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-panel-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>Reservar Cita</h2>

      <div class="mb-3">
        <label class="form-label">Especialidad</label>
        <select class="form-select" (change)="onEspecialidadChange($event)">
          <option value="">-- Seleccione --</option>
          <option *ngFor="let esp of especialidades" [value]="esp.id">{{ esp.nombre }}</option>
        </select>
      </div>

      <div class="mb-3" *ngIf="medicos.length > 0">
        <label class="form-label">Médico</label>
        <select class="form-select" [(ngModel)]="medicoSeleccionado">
          <option value="">-- Seleccione --</option>
          <option *ngFor="let med of medicos" [value]="med.id">{{ med.nombres }}</option>
        </select>
      </div>

      <div class="mb-3" *ngIf="medicoSeleccionado">
        <label class="form-label">Fecha</label>
        <input type="date" class="form-control" [(ngModel)]="fecha">
      </div>

      <div class="mb-3" *ngIf="medicoSeleccionado">
        <label class="form-label">Hora</label>
        <input type="time" class="form-control" [(ngModel)]="hora">
      </div>

      <button class="btn btn-success" *ngIf="medicoSeleccionado" (click)="reservarCita()">Reservar</button>

      <p class="mt-3" [class.text-success]="exito" [class.text-danger]="!exito">{{ mensaje }}</p>
    </div>
  `
})
export class PanelPaciente implements OnInit {
  especialidades: any[] = [];
  medicos: any[] = [];
  medicoSeleccionado = '';
  fecha = '';
  hora = '';
  mensaje = '';
  exito = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('/api/especialidades/').subscribe((data: any) => this.especialidades = data);
  }

  onEspecialidadChange(event: any) {
    const espId = event.target.value;
    this.medicoSeleccionado = '';
    this.medicos = [];
    if (!espId) return;

    this.http.get(`/api/medicos/?especialidad=${espId}`).subscribe((data: any) => {
      this.medicos = data;
    });
  }

  reservarCita() {
    if (!this.medicoSeleccionado || !this.fecha || !this.hora) {
      this.mensaje = 'Complete todos los campos.';
      this.exito = false;
      return;
    }

    const body = {
      medico: this.medicoSeleccionado,
      fecha: this.fecha,
      hora: this.hora,
    };

    const token = localStorage.getItem('token') || '';

    this.http.post('/api/citas/reservar/', body, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.mensaje = 'Cita reservada con éxito.';
        this.exito = true;
      },
      error: (err) => {
        console.error(err);
        this.mensaje = err?.error?.error || 'Error al reservar la cita.';
        this.exito = false;
      }
    });
  }
}