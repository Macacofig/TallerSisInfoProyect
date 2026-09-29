import { Component, inject, signal } from '@angular/core';
import { Router} from '@angular/router';
import { NAVBAR_MESSAGES } from '../../app/strings/layout/navbar.messages';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly NAVBAR_MESSAGES = NAVBAR_MESSAGES;

  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  readonly usuario = this.authService.obtenerUsuarioSignal();

  readonly menuUsuarioAbierto = signal(false);

  alternarMenuUsuario(): void {
    this.menuUsuarioAbierto.update(abierto => !abierto);
  } 

  cerrarSesion(): void {
    this.menuUsuarioAbierto.set(false);
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  obtenerIniciales(): string {
    const nombre = this.usuario()?.nombre ?? '';

    const partes = nombre.trim().split(/\s+/);

    if (partes.length === 0) {
      return '';
    }

    if (partes.length === 1) {
      return partes[0].charAt(0).toUpperCase();
    }

    return (
      partes[0].charAt(0) +
      partes[1].charAt(0)
    ).toUpperCase();
  }

  irAPerfil(): void {
    this.menuUsuarioAbierto.set(false);
    this.router.navigate(['/perfil']);
  }
}