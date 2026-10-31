import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';
import { LanguageService } from '../../app/services/language.service';
import { FeatureToggleService } from '../../app/services/feature-toggle.service';
import { NAVBAR_MESSAGES } from '../../app/strings/layout/navbar.messages';
import { NAVBAR_MESSAGES_EN } from '../../app/strings/layout/navbar-ingles.messages';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  readonly featureToggleService = inject(FeatureToggleService);
  private readonly router = inject(Router);

  get NAVBAR_MESSAGES() {
    return this.languageService.getMessages(NAVBAR_MESSAGES, NAVBAR_MESSAGES_EN);
  }

  get idiomaActual(): 'es' | 'en' {
    return this.languageService.currentLanguage();
  }

  get idiomaBoton(): string {
    return this.idiomaActual === 'es' ? 'EN' : 'ES';
  }

  readonly usuario = this.authService.obtenerUsuarioSignal();
  readonly menuUsuarioAbierto = signal(false);

  alternarMenuUsuario(): void {
    this.menuUsuarioAbierto.update(abierto => !abierto);
  }

  cambiarIdioma(): void {
    this.languageService.toggleLanguage();
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