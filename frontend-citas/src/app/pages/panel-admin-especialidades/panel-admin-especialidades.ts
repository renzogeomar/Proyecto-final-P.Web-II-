import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';

interface EspecialidadConMedicos extends Especialidad {
  medicos: { id: number; nombres: string; correo: string; especialidad: number }[];
}

@Component({
  selector: 'app-panel-admin-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-admin-especialidades.html',
  styleUrls: ['./panel-admin-especialidades.css']
})
export class PanelAdminEspecialidades implements OnInit {
  especialidades: EspecialidadConMedicos[] = [];
  cargando = true;
  mensaje = '';

  // Para formulario
  mostrandoFormulario = false;
  modo: 'crear' | 'editar' = 'crear';
  formEspecialidad: Especialidad = { id: 0, nombre: '' };

  constructor(private espSvc: EspecialidadService) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades() {
    this.cargando = true;
    this.espSvc.getEspecialidadesConMedicos().subscribe({
      next: data => {
        this.especialidades = data;
        this.cargando = false;
      },
      error: err => {
        console.error('Error cargando especialidades:', err);
        this.mensaje = 'Error cargando especialidades';
        this.cargando = false;
      }
    });
  }

  nuevaEspecialidad() {
    this.modo = 'crear';
    this.formEspecialidad = { id: 0, nombre: '' };
    this.mostrandoFormulario = true;
  }

  editarEspecialidad(esp: Especialidad) {
    this.modo = 'editar';
    this.formEspecialidad = { ...esp };
    this.mostrandoFormulario = true;
  }

  cancelarFormulario() {
    this.mostrandoFormulario = false;
    this.formEspecialidad = { id: 0, nombre: '' };
    this.modo = 'crear';
  }

  guardarEspecialidad() {
    if (this.modo === 'crear') {
      this.espSvc.crearEspecialidad(this.formEspecialidad.nombre).subscribe({
        next: () => {
          this.mensaje = 'Especialidad creada.';
          this.cancelarFormulario();
          this.cargarEspecialidades();
        },
        error: err => {
          console.error('Error creando especialidad:', err);
          this.mensaje = 'Error creando especialidad.';
        }
      });
    } else {
      this.espSvc.editarEspecialidad(this.formEspecialidad.id, this.formEspecialidad.nombre).subscribe({
        next: () => {
          this.mensaje = 'Especialidad actualizada.';
          this.cancelarFormulario();
          this.cargarEspecialidades();
        },
        error: err => {
          console.error('Error actualizando especialidad:', err);
          this.mensaje = 'Error actualizando especialidad.';
        }
      });
    }
  }

  eliminarEspecialidad(esp: Especialidad) {
    if (!confirm(`¿Eliminar la especialidad "${esp.nombre}"?`)) return;
    this.espSvc.eliminarEspecialidad(esp.id).subscribe({
      next: () => {
        this.mensaje = 'Especialidad eliminada.';
        this.cargarEspecialidades();
      },
      error: err => {
        console.error('Error eliminando especialidad:', err);
        this.mensaje = 'Error eliminando especialidad.';
      }
    });
  }
}