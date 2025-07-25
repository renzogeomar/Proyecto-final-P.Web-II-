import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {

  constructor(private router: Router) {}

  get usuarioLogueado(): boolean {
    return localStorage.getItem('token') !== null;
  }

  get nombreUsuario(): string {
    return localStorage.getItem('username') || '';
  }

  get rol(): string {
    return localStorage.getItem('rol') || '';
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
    this.router.navigate(['/login']);
  }
}