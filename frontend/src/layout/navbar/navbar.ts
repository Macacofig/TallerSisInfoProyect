import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NAVBAR_MESSAGES } from '../../app/strings/layout/navbar.messages';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly NAVBAR_MESSAGES = NAVBAR_MESSAGES;

  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  readonly usuario = this.authService.obtenerUsuario();

  readonly menuUsuarioAbierto = signal(false);

  alternarMenuUsuario(): void {
    this.menuUsuarioAbierto.update(abierto => !abierto);
  } 

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  obtenerIniciales(): string {
    if (!this.usuario?.nombre) {
      return '';
  }

  const partes = this.usuario.nombre.trim().split(/\s+/);

  const nombre = partes[0];
  const apellido = partes[1];

  if (!apellido) {
    return nombre.charAt(0).toUpperCase();
  }

  return (
    nombre.charAt(0) + apellido.charAt(0)
  ).toUpperCase();
}
}