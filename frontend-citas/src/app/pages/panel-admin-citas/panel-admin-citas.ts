import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { AdminCitasService, CitaAdmin } from '../../services/admin-citas.service';
import { AdminPacientesService, PacienteAdmin } from '../../services/admin-pacientes.service';
import { AdminMedicosService, MedicoAdmin } from '../../services/admin-medicos.service';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';

@Component({
  selector: 'app-panel-admin-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-admin-citas.html',
  styleUrls: ['./panel-admin-citas.css']
})
export class PanelAdminCitas implements OnInit {

  citas: CitaAdmin[] = [];
  pacientes: PacienteAdmin[] = [];
  medicos: MedicoAdmin[] = [];
  especialidades: Especialidad[] = [];

  cargando = true;
  mensaje = '';
  busqueda = '';

  mostrandoFormulario = false;
  modo: 'crear' | 'editar' = 'crear';

  formCita: any = this.formPorDefecto();

  estados = ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada'];

  constructor(
    private svc: AdminCitasService,
    private pacSvc: AdminPacientesService,
    private medSvc: AdminMedicosService,
    private espSvc: EspecialidadService,
  ) {}

  ngOnInit(): void {
    this.cargarDataInicial();
  }

  private formPorDefecto() {
    return {
      id: null,
      paciente: null as number | null,
      medico: null as number | null,
      fecha: '',
      hora: '',
      estado: 'Pendiente',
    };
  }

  cargarDataInicial() {
    this.cargando = true;

    // Pacientes
    this.pacSvc.listar().subscribe({
      next: pacs => this.pacientes = pacs,
      error: err => console.error('Error pacientes', err)
    });

    // Médicos
    this.medSvc.listar().subscribe({
      next: meds => this.medicos = meds,
      error: err => console.error('Error medicos', err)
    });

    // Especialidades
    this.espSvc.listar().subscribe({
      next: esps => this.especialidades = esps,
      error: err => console.error('Error especialidades', err)
    });

    // Citas
    this.cargarCitas();
  }

  cargarCitas() {
    this.svc.listar(this.busqueda).subscribe({
      next: data => {
        this.citas = data;
        this.cargando = false;
      },
      error: err => {
        console.error('Error cargando citas:', err);
        this.mensaje = 'Error cargando citas.';
        this.cargando = false;
      }
    });
  }

  buscar() {
    this.cargarCitas();
  }

  nuevo() {
    this.modo = 'crear';
    this.formCita = this.formPorDefecto();
    this.mostrandoFormulario = true;
  }

  editar(c: CitaAdmin) {
    this.modo = 'editar';
    this.formCita = {
      id: c.id,
      paciente: c.paciente,
      medico: c.medico,
      fecha: c.fecha,
      hora: c.hora,
      estado: c.estado,
    };
    this.mostrandoFormulario = true;
  }

  cancelar() {
    this.mostrandoFormulario = false;
    this.formCita = this.formPorDefecto();
  }

  guardar(form: NgForm) {
    if (form.invalid) return;

    const payload = {
      paciente: this.formCita.paciente,
      medico: this.formCita.medico,
      fecha: this.formCita.fecha,
      hora: this.formCita.hora,
      estado: this.formCita.estado,
    };

    if (this.modo === 'crear') {
      this.svc.crear(payload).subscribe({
        next: () => {
          this.mensaje = 'Cita creada.';
          this.cancelar();
          this.cargarCitas();
        },
        error: err => {
          console.error('Error creando cita:', err);
          this.mensaje = 'Error creando cita.';
        }
      });
    } else {
      this.svc.actualizar(this.formCita.id, payload).subscribe({
        next: () => {
          this.mensaje = 'Cita actualizada.';
          this.cancelar();
          this.cargarCitas();
        },
        error: err => {
          console.error('Error actualizando cita:', err);
          this.mensaje = 'Error actualizando cita.';
        }
      });
    }
  }

  eliminar(c: CitaAdmin) {
    if (!confirm(`¿Eliminar la cita de ${c.paciente_username} con ${c.medico_nombre}?`)) return;
    this.svc.eliminar(c.id).subscribe({
      next: () => {
        this.mensaje = 'Cita eliminada.';
        this.cargarCitas();
      },
      error: err => {
        console.error('Error eliminando cita:', err);
        this.mensaje = 'Error eliminando cita.';
      }
    });
  }

  // Helpers
  nombrePaciente(id: number): string {
    const p = this.pacientes.find(x => x.id === id);
    if (!p) return `#${id}`;
    return `${p.first_name} ${p.last_name}`.trim() || p.username;
  }

  nombreMedico(id: number): string {
    const m = this.medicos.find(x => x.id === id);
    return m ? m.nombres : `#${id}`;
  }

  nombreEspecialidad(id: number | null | undefined): string {
    if (id == null) return '';
    const e = this.especialidades.find(x => x.id === id);
    return e ? e.nombre : `#${id}`;
  }
}