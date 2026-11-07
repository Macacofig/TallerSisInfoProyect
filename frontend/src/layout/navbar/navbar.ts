import { Component, DestroyRef, ElementRef, HostListener, effect, inject, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, forkJoin, of } from 'rxjs';
import { APP_CONFIG } from '../../app/config/app-config';
import { Notificacion, NotificacionesPage } from '../../app/models/notificacion.model';
import { NotificacionesService } from '../../app/services/notificaciones.service';
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
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly notificacionesAbiertas = signal(false);
  readonly notificaciones = signal<Notificacion[]>([]);
  readonly noLeidas = signal(0);
  readonly cargandoNotificaciones = signal(false);
  readonly errorNotificaciones = signal(false);
  readonly errorLectura = signal(false);
  readonly guardandoLectura = signal(false);
  readonly hayMas = signal(false);
  readonly ahora = signal(Date.now());
  private pagina = 0;
  private sesion = new Subscription();
  private consulta = new Subscription();
  private timer?: ReturnType<typeof setInterval>;
  private sesionActiva = false;

  constructor() {
    effect(() => {
      // Track identity/token only: profile edits must not start another timer.
      const usuario = this.usuario();
      const clave = usuario ? `${usuario.id}:${usuario.accessToken ?? ''}` : '';
      untracked(() => this.iniciarNotificaciones(clave));
    });
    inject(DestroyRef).onDestroy(() => this.limpiarNotificaciones());
  }

  private claveSesion = '';

  private iniciarNotificaciones(clave: string): void {
    if (clave === this.claveSesion) return;
    this.limpiarNotificaciones();
    this.claveSesion = clave;
    if (!this.authService.tieneSesionValida()) return;
    this.sesionActiva = true;
    this.refrescarNotificaciones();
    if (!this.sesionActiva) return;
    this.timer = setInterval(() => {
      this.ahora.set(Date.now());
      if (!this.authService.tieneSesionValida()) {
        this.limpiarNotificaciones();
        return;
      }
      if (!this.cargandoNotificaciones() && !this.guardandoLectura()) this.refrescarNotificaciones();
    }, APP_CONFIG.TIMEOUTS.NOTIFICATIONS_POLLING_MS);
  }

  private limpiarNotificaciones(): void {
    clearInterval(this.timer);
    this.timer = undefined;
    this.sesion.unsubscribe();
    this.consulta.unsubscribe();
    this.sesion = new Subscription();
    this.consulta = new Subscription();
    this.sesionActiva = false;
    this.notificacionesAbiertas.set(false);
    this.notificaciones.set([]);
    this.noLeidas.set(0);
    this.hayMas.set(false);
    this.cargandoNotificaciones.set(false);
    this.guardandoLectura.set(false);
    this.errorNotificaciones.set(false);
    this.errorLectura.set(false);
    this.pagina = 0;
  }

  alternarNotificaciones(): void {
    if (!this.sesionActiva || !this.authService.tieneSesionValida()) {
      this.limpiarNotificaciones();
      return;
    }
    this.menuUsuarioAbierto.set(false);
    this.notificacionesAbiertas.update(abierto => !abierto);
    if (this.notificacionesAbiertas()) {
      this.pagina = 0;
      this.notificaciones.set([]);
      this.hayMas.set(false);
      this.refrescarNotificaciones();
    }
  }

  refrescarNotificaciones(): void {
    if (!this.sesionActiva || this.guardandoLectura()) return;
    this.consulta.unsubscribe();
    this.consulta = new Subscription();
    this.sesion.add(this.consulta);
    this.errorNotificaciones.set(false);
    const abierto = this.notificacionesAbiertas();
    this.cargandoNotificaciones.set(true);
    // Refresh all loaded pages together so polling preserves pagination coherently.
    const paginas = abierto
      ? Array.from({ length: this.pagina + 1 }, (_, page) => this.notificacionesService.obtenerNotificaciones(page, 20))
      : [];
    this.consulta.add(forkJoin({
      contador: this.notificacionesService.obtenerCantidadNoLeidas(),
      paginas: paginas.length ? forkJoin(paginas) : this.paginasVacias()
    }).subscribe({
      next: ({ contador, paginas: resultado }) => {
        this.noLeidas.set(contador.count);
        if (abierto && resultado.length) {
          this.notificaciones.set(this.sinDuplicados(resultado.flatMap(p => p.content)));
          this.hayMas.set(resultado[resultado.length - 1].hasMore);
        }
        this.cargandoNotificaciones.set(false);
      },
      error: error => this.falloConsulta(error)
    }));
  }

  private paginasVacias() {
    return of<NotificacionesPage[]>([]);
  }

  cargarMasNotificaciones(): void {
    if (!this.sesionActiva || !this.hayMas() || this.cargandoNotificaciones() || this.guardandoLectura()) return;
    this.errorNotificaciones.set(false);
    this.cargandoNotificaciones.set(true);
    this.consulta.add(this.notificacionesService.obtenerNotificaciones(this.pagina + 1, 20).subscribe({
      next: resultado => {
        this.pagina = resultado.page;
        this.notificaciones.set(this.sinDuplicados([...this.notificaciones(), ...resultado.content]));
        this.hayMas.set(resultado.hasMore);
        this.cargandoNotificaciones.set(false);
      },
      error: error => this.falloConsulta(error)
    }));
  }

  private sinDuplicados(lista: Notificacion[]): Notificacion[] {
    return [...new Map(lista.map(n => [n.id, n])).values()];
  }

  marcarNotificacion(notificacion: Notificacion): void {
    if (notificacion.leida) return;
    this.guardarLectura(notificacion.id);
  }

  marcarTodasNotificaciones(): void { this.guardarLectura(); }

  private guardarLectura(id?: number): void {
    if (!this.sesionActiva || this.guardandoLectura()) return;
    this.consulta.unsubscribe();
    this.cargandoNotificaciones.set(false);
    this.guardandoLectura.set(true);
    this.errorLectura.set(false);
    const request = id === undefined ? this.notificacionesService.marcarTodasComoLeidas()
      : this.notificacionesService.marcarComoLeida(id);
    this.sesion.add(request.subscribe({
      next: () => {
        const eraNoLeida = id !== undefined && this.notificaciones().some(n => n.id === id && !n.leida);
        this.noLeidas.update(total => id === undefined ? 0 : Math.max(0, total - (eraNoLeida ? 1 : 0)));
        this.notificaciones.update(lista => lista.map(n => id === undefined || n.id === id ? { ...n, leida: true } : n));
        this.guardandoLectura.set(false);
        // Count is authoritative: other tabs may have changed read status.
        this.refrescarNotificaciones();
      },
      error: error => {
        this.guardandoLectura.set(false);
        this.errorLectura.set(true);
        this.comprobarAutenticacion(error);
      }
    }));
  }

  private falloConsulta(error: unknown): void {
    this.cargandoNotificaciones.set(false);
    this.errorNotificaciones.set(true);
    this.comprobarAutenticacion(error);
  }

  private comprobarAutenticacion(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 401) this.limpiarNotificaciones();
  }

  textoNotificacion(n: Notificacion): { titulo: string; mensaje: string } {
    const textos: Record<string, { titulo: string; mensaje: string }> = this.NAVBAR_MESSAGES.NOTIFICATIONS_TYPES;
    return Object.hasOwn(textos, n.tipo) ? textos[n.tipo] : n;
  }

  tiempoRelativo(fecha: string): string {
    const segundos = Math.max(0, Math.floor((this.ahora() - Date.parse(fecha)) / 1000));
    if (!Number.isFinite(segundos)) return '';
    const formato = new Intl.RelativeTimeFormat(this.idiomaActual, { numeric: 'auto', style: 'short' });
    if (segundos < 60) return formato.format(0, 'minute');
    if (segundos < 3600) return formato.format(-Math.floor(segundos / 60), 'minute');
    if (segundos < 86400) return formato.format(-Math.floor(segundos / 3600), 'hour');
    return formato.format(-Math.floor(segundos / 86400), 'day');
  }

  @HostListener('document:click', ['$event'])
  cerrarPorClicExterior(event: Event): void {
    const panel = this.element.nativeElement.querySelector('.navbar__notifications-container');
    if (event.target instanceof Node && !panel?.contains(event.target)) this.notificacionesAbiertas.set(false);
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    if (this.notificacionesAbiertas()) {
      this.notificacionesAbiertas.set(false);
      this.element.nativeElement.querySelector<HTMLButtonElement>('.navbar__notification')?.focus();
    }
  }

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
    this.notificacionesAbiertas.set(false);
    this.menuUsuarioAbierto.update(abierto => !abierto);
  }

  cambiarIdioma(): void {
    this.languageService.toggleLanguage();
  }

  cerrarSesion(): void {
    this.limpiarNotificaciones();
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
