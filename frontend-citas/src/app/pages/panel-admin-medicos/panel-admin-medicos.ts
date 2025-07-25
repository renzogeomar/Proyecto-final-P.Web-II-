import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminMedicosService, MedicoAdmin } from '../../services/admin-medicos.service';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';
import { AdminHorariosService, HorarioAdmin } from '../../services/admin-horarios.service';

@Component({
  selector: 'app-panel-admin-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-admin-medicos.html',
  styleUrls: ['./panel-admin-medicos.css']
})
export class PanelAdminMedicos implements OnInit {

  // ------------------ Médicos ------------------
  medicos: MedicoAdmin[] = [];
  especialidades: Especialidad[] = [];
  cargando = true;
  mensaje = '';
  busqueda = '';

  // Vistas: lista | formMedico | horarios
  vista: 'lista' | 'formMedico' | 'horarios' = 'lista';
  modo: 'crear' | 'editar' = 'crear';

  formMedico: any = this.formMedicoPorDefecto();

  // ------------------ Horarios ------------------
  medicoActual: MedicoAdmin | null = null;
  horarios: HorarioAdmin[] = [];
  cargandoHorarios = false;
  modoHorario: 'crear' | 'editar' = 'crear';
  formHorario: any = this.formHorarioPorDefecto();

  constructor(
    private svc: AdminMedicosService,
    private espSvc: EspecialidadService,
    private horSvc: AdminHorariosService
  ) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarMedicos();
  }

  // ======= Médicos =======
  private formMedicoPorDefecto() {
    return {
      id: null,
      nombres: '',
      correo: '',
      especialidad: null as number | null
    };
  }

  cargarEspecialidades() {
    this.espSvc.listar().subscribe({
      next: data => this.especialidades = data,
      error: err => console.error('Error cargando especialidades', err)
    });
  }

  cargarMedicos() {
    this.cargando = true;
    this.svc.listar(this.busqueda).subscribe({
      next: data => {
        this.medicos = data;
        this.cargando = false;
      },
      error: err => {
        console.error('Error cargando médicos:', err);
        this.mensaje = 'Error cargando médicos';
        this.cargando = false;
      }
    });
  }

  nombreDeEspecialidad(id: number): string {
    const e = this.especialidades.find(x => x.id === id);
    return e ? e.nombre : `#${id}`;
  }

  buscar() {
    this.cargarMedicos();
  }

  nuevoMedico() {
    this.modo = 'crear';
    this.formMedico = this.formMedicoPorDefecto();
    this.vista = 'formMedico';
  }

  editarMedico(m: MedicoAdmin) {
    this.modo = 'editar';
    this.formMedico = { ...m };
    this.vista = 'formMedico';
  }

  cancelarMedico() {
    this.vista = 'lista';
    this.formMedico = this.formMedicoPorDefecto();
    this.modo = 'crear';
  }

  guardarMedico() {
    if (this.modo === 'crear') {
      this.svc.crear(this.formMedico).subscribe({
        next: () => {
          this.mensaje = 'Médico creado.';
          this.cancelarMedico();
          this.cargarMedicos();
        },
        error: err => {
          console.error('Error creando médico:', err);
          this.mensaje = 'Error creando médico.';
        }
      });
    } else {
      this.svc.actualizar(this.formMedico.id, this.formMedico).subscribe({
        next: () => {
          this.mensaje = 'Médico actualizado.';
          this.cancelarMedico();
          this.cargarMedicos();
        },
        error: err => {
          console.error('Error actualizando médico:', err);
          this.mensaje = 'Error actualizando médico.';
        }
      });
    }
  }

  eliminarMedico(m: MedicoAdmin) {
    if (!confirm(`¿Eliminar al médico "${m.nombres}"?`)) return;
    this.svc.eliminar(m.id).subscribe({
      next: () => {
        this.mensaje = 'Médico eliminado.';
        this.cargarMedicos();
      },
      error: err => {
        console.error('Error eliminando médico:', err);
        this.mensaje = 'Error eliminando médico.';
      }
    });
  }

  // ======= Horarios =======
  private formHorarioPorDefecto() {
    return {
      id: null,
      fecha: '',
      hora: '',
      disponible: true
    };
  }

  verHorarios(m: MedicoAdmin) {
    this.medicoActual = m;
    this.vista = 'horarios';
    this.cargarHorarios();
  }

  cargarHorarios() {
    if (!this.medicoActual) return;
    this.cargandoHorarios = true;
    this.horSvc.listar(this.medicoActual.id).subscribe({
      next: data => {
        this.horarios = data;
        this.cargandoHorarios = false;
      },
      error: err => {
        console.error('Error cargando horarios:', err);
        this.mensaje = 'Error cargando horarios.';
        this.cargandoHorarios = false;
      }
    });
  }

  nuevoHorario() {
    this.modoHorario = 'crear';
    this.formHorario = this.formHorarioPorDefecto();
  }

  editarHorario(h: HorarioAdmin) {
    this.modoHorario = 'editar';
    // Normalizamos hora HH:MM
    const hora = h.hora.slice(0,5);
    this.formHorario = {
      id: h.id,
      fecha: h.fecha,
      hora,
      disponible: h.disponible
    };
  }

  cancelarHorario() {
    this.modoHorario = 'crear';
    this.formHorario = this.formHorarioPorDefecto();
  }

  guardarHorario() {
    if (!this.medicoActual) return;

    if (this.modoHorario === 'crear') {
      this.horSvc.crear(this.medicoActual.id, {
        fecha: this.formHorario.fecha,
        hora: this.formHorario.hora,
        disponible: this.formHorario.disponible
      }).subscribe({
        next: () => {
          this.mensaje = 'Horario creado.';
          this.cancelarHorario();
          this.cargarHorarios();
        },
        error: err => {
          console.error('Error creando horario:', err);
          this.mensaje = 'Error creando horario.';
        }
      });
    } else {
      this.horSvc.actualizar(this.formHorario.id, {
        fecha: this.formHorario.fecha,
        hora: this.formHorario.hora,
        disponible: this.formHorario.disponible
      }).subscribe({
        next: () => {
          this.mensaje = 'Horario actualizado.';
          this.cancelarHorario();
          this.cargarHorarios();
        },
        error: err => {
          console.error('Error actualizando horario:', err);
          this.mensaje = 'Error actualizando horario.';
        }
      });
    }
  }

  eliminarHorario(h: HorarioAdmin) {
    if (!confirm(`¿Eliminar el horario ${h.fecha} ${h.hora}?`)) return;
    this.horSvc.eliminar(h.id).subscribe({
      next: () => {
        this.mensaje = 'Horario eliminado.';
        this.cargarHorarios();
      },
      error: err => {
        console.error('Error eliminando horario:', err);
        this.mensaje = 'Error eliminando horario.';
      }
    });
  }

  volverAListaMedicos() {
    this.vista = 'lista';
    this.medicoActual = null;
    this.cancelarHorario();
  }
}