import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from '../../services/especialidad.service';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especialidades.html',
  styleUrls: ['./especialidades.css']
})
export class Especialidades implements OnInit {
  especialidades: any[] = [];
  nuevaEspecialidad: string = '';

  constructor(private servicio: EspecialidadService) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.servicio.getEspecialidadesConMedicos().subscribe(data => {
      this.especialidades = data;
    });
  }

  crearEspecialidad(): void {
    if (this.nuevaEspecialidad.trim() === '') return;

    this.servicio.crearEspecialidad(this.nuevaEspecialidad).subscribe(() => {
      this.nuevaEspecialidad = '';
      this.cargarEspecialidades();
    });
  }

  eliminarEspecialidad(id: number): void {
    this.servicio.eliminarEspecialidad(id).subscribe(() => {
      this.cargarEspecialidades();
    });
  }

  confirmarEliminar(id: number): void {
    if (confirm('¿Seguro que quieres eliminar esta especialidad?')) {
      this.eliminarEspecialidad(id);
    }
  }
}