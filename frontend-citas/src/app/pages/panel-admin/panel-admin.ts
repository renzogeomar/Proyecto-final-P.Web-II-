import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminPacientesService, PacienteAdmin } from '../../services/admin-pacientes.service';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-admin.html',
  styleUrls: ['./panel-admin.css']
})
export class PanelAdmin implements OnInit {

  pacientes: PacienteAdmin[] = [];
  cargando = true;
  mensaje = '';
  busqueda = '';

  // Control de vista
  mostrandoFormulario = false;
  modo: 'crear' | 'editar' = 'crear';

  // Formulario
  formPaciente: any = this.formPorDefecto();

  constructor(private svc: AdminPacientesService) {}

  ngOnInit(): void {
    this.cargarPacientes();
  }

  private formPorDefecto() {
    return {
      id: null,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      telefono: '',
      password: ''
    };
  }

  // ----- Listado -----
  cargarPacientes() {
    this.cargando = true;
    this.svc.listar(this.busqueda).subscribe({
      next: data => {
        this.pacientes = data;
        this.cargando = false;
      },
      error: err => {
        console.error('Error cargando pacientes:', err);
        this.mensaje = 'Error cargando pacientes';
        this.cargando = false;
      }
    });
  }

  buscar() {
    this.cargarPacientes();
  }

  // ----- Formulario: Crear -----
  nuevoPaciente() {
    this.modo = 'crear';
    this.formPaciente = this.formPorDefecto();
    this.mostrandoFormulario = true;
  }

  // ----- Formulario: Editar -----
  editarPaciente(p: PacienteAdmin) {
    this.modo = 'editar';
    // Clonar para no tocar la tabla en vivo
    this.formPaciente = { ...p, password: '' };
    this.mostrandoFormulario = true;
  }

  cancelarFormulario() {
    this.mostrandoFormulario = false;
    this.formPaciente = this.formPorDefecto();
    this.modo = 'crear';
  }

  guardarPaciente() {
    if (this.modo === 'crear') {
      this.svc.crear(this.formPaciente).subscribe({
        next: () => {
          this.mensaje = 'Paciente creado.';
          this.cancelarFormulario();
          this.cargarPacientes();
        },
        error: err => {
          console.error('Error creando paciente:', err);
          this.mensaje = 'Error creando paciente.';
        }
      });
    } else {
      this.svc.actualizar(this.formPaciente.id, this.formPaciente).subscribe({
        next: () => {
          this.mensaje = 'Paciente actualizado.';
          this.cancelarFormulario();
          this.cargarPacientes();
        },
        error: err => {
          console.error('Error actualizando paciente:', err);
          this.mensaje = 'Error actualizando paciente.';
        }
      });
    }
  }

  eliminarPaciente(p: PacienteAdmin) {
    if (!confirm(`¿Eliminar al paciente "${p.username}"?`)) return;
    this.svc.eliminar(p.id).subscribe({
      next: () => {
        this.mensaje = 'Paciente eliminado.';
        this.cargarPacientes();
      },
      error: err => {
        console.error('Error eliminando paciente:', err);
        this.mensaje = 'Error eliminando paciente.';
      }
    });
  }
}