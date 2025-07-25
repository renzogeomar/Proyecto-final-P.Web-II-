import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  username = '';
  password = '';
  email = '';
  mensaje = '';

  constructor(private auth: Auth) {}

  registrar() {
    this.auth.register({ username: this.username, password: this.password, email: this.email })
      .subscribe({
        next: res => {
          this.mensaje = '¡Usuario creado!';
          setTimeout(() => location.href = '/login', 1000); // Redirige después de 1 segundo
        },
        error: err => this.mensaje = err.error.error || 'Error al registrar'
      });
  }

}
