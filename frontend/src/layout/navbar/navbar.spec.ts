import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { AuthService } from '../../app/services/auth.service';
import { NotificacionesService } from '../../app/services/notificaciones.service';
import { Notificacion, NotificacionesPage } from '../../app/models/notificacion.model';

import { LanguageService } from '../../app/services/language.service';
import { FeatureToggleService, FEATURE_TOGGLE_STORAGE_KEYS } from '../../app/services/feature-toggle.service';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let languageService: LanguageService;

  beforeEach(async () => {
    localStorage.removeItem('unihub-language');
    localStorage.removeItem(FEATURE_TOGGLE_STORAGE_KEYS.cambioIdioma);

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    languageService = TestBed.inject(LanguageService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('muestra el botón de idioma con el flag activo', () => {
    TestBed.inject(FeatureToggleService).setCambioIdioma(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.navbar__language-toggle')).toBeTruthy();
  });

  it('no muestra el botón de idioma con el flag desactivado', () => {
    TestBed.inject(FeatureToggleService).setCambioIdioma(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.navbar__language-toggle')).toBeNull();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the profile trigger as a named button and keeps menu state in sync', async () => {
    const trigger = fixture.nativeElement.querySelector('.navbar__user') as HTMLButtonElement;

    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.type).toBe('button');
    expect(trigger.getAttribute('aria-label')).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('.navbar__user-menu-item').length).toBe(2);

    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.navbar__user-menu')).toBeNull();
  });

  it('switches visible labels from Spanish to English and back', async () => {
    const toggle = fixture.nativeElement.querySelector(
      '.navbar__language-toggle'
    ) as HTMLButtonElement;

    expect(toggle.textContent?.trim()).toBe('EN');
    expect(toggle.getAttribute('aria-label')).toBe('Cambiar idioma');

    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(languageService.currentLanguage()).toBe('en');
    expect(toggle.textContent?.trim()).toBe('ES');
    expect(toggle.getAttribute('aria-label')).toBe('Change language');
    expect(document.documentElement.lang).toBe('en');

    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(languageService.currentLanguage()).toBe('es');
    expect(toggle.textContent?.trim()).toBe('EN');
    expect(toggle.getAttribute('aria-label')).toBe('Cambiar idioma');
    expect(document.documentElement.lang).toBe('es');
  });
});

describe('Navbar: notificaciones HU-19', () => {
  let fixture: ComponentFixture<Navbar>;
  let component: Navbar;
  let usuario: ReturnType<typeof signal<{ id: number; nombre: string; accessToken: string } | null>>;
  let sesionValida: boolean;
  const n = (id = 1, leida = false): Notificacion => ({
    id, tipo: 'POSTULACION_APROBADA', titulo: 'Fallback', mensaje: 'Fallback persistido', leida,
    fechaCreacion: new Date(Date.now() - 120000).toISOString(), referenciaTipo: 'SOLICITUD_AYUDANTE', referenciaId: 8
  });
  const page = (content: Notificacion[] = [], page = 0, hasMore = false): NotificacionesPage => ({
    content, page, size: 20, totalElements: hasMore ? 21 : content.length, hasMore
  });
  let api: {
    obtenerNotificaciones: ReturnType<typeof vi.fn>;
    obtenerCantidadNoLeidas: ReturnType<typeof vi.fn>;
    marcarComoLeida: ReturnType<typeof vi.fn>;
    marcarTodasComoLeidas: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    localStorage.removeItem('unihub-language');
    usuario = signal({ id: 1, nombre: 'Ana', accessToken: 'token' });
    sesionValida = true;
    api = {
      obtenerNotificaciones: vi.fn().mockReturnValue(of(page())),
      obtenerCantidadNoLeidas: vi.fn().mockReturnValue(of({ count: 0 })),
      marcarComoLeida: vi.fn().mockReturnValue(of(undefined)),
      marcarTodasComoLeidas: vi.fn().mockReturnValue(of(undefined))
    };
    await TestBed.configureTestingModule({ imports: [Navbar], providers: [provideRouter([]),
      { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
      { provide: NotificacionesService, useValue: api },
      { provide: AuthService, useValue: {
        obtenerUsuarioSignal: () => usuario.asReadonly(),
        tieneSesionValida: () => sesionValida,
        cerrarSesion: () => { sesionValida = false; usuario.set(null); }
      } }
    ] }).compileComponents();
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => { fixture.destroy(); vi.useRealTimers(); });
  const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement | null;
  const abrir = () => { query('.navbar__notification')!.click(); fixture.detectChanges(); };

  it('abre/cierra con la campana y coordina el menú de perfil', () => {
    expect(query('.navbar__notification')!.getAttribute('aria-expanded')).toBe('false');
    abrir();
    expect(query('#navbar-notifications')).toBeTruthy();
    expect(api.obtenerNotificaciones).toHaveBeenCalledWith(0, 20);
    component.alternarMenuUsuario(); fixture.detectChanges();
    expect(component.notificacionesAbiertas()).toBe(false);
    abrir();
    expect(component.menuUsuarioAbierto()).toBe(false);
    abrir();
    expect(query('#navbar-notifications')).toBeNull();
  });

  it('cierra con Escape y clic exterior, pero conserva clics internos', () => {
    abrir();
    query('#navbar-notifications')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.notificacionesAbiertas()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(component.notificacionesAbiertas()).toBe(false);
    abrir();
    document.body.click();
    expect(component.notificacionesAbiertas()).toBe(false);
  });

  it('oculta badge cero y muestra el contador positivo', () => {
    expect(query('.navbar__notification-badge')).toBeNull();
    api.obtenerCantidadNoLeidas.mockReturnValue(of({ count: 3 }));
    vi.advanceTimersByTime(30000); fixture.detectChanges();
    expect(query('.navbar__notification-badge')!.textContent).toContain('3');
  });

  it('muestra carga, vacío, error y reintento', () => {
    const pendiente = new Subject<NotificacionesPage>();
    api.obtenerNotificaciones.mockReturnValueOnce(pendiente);
    abrir();
    expect(query('[role="status"]')!.textContent).toContain('Cargando');
    pendiente.next(page()); pendiente.complete(); fixture.detectChanges();
    expect(query('#navbar-notifications')!.textContent).toContain('No tienes notificaciones');
    api.obtenerNotificaciones.mockReturnValueOnce(throwError(() => new Error('fallo')));
    component.refrescarNotificaciones(); fixture.detectChanges();
    expect(query('[role="alert"]')!.textContent).toContain('Error al cargar');
    (query('[role="alert"] button') as HTMLButtonElement).click(); fixture.detectChanges();
    expect(component.errorNotificaciones()).toBe(false);
  });

  it('lista leídas/no leídas y solo guarda lectura tras éxito', () => {
    api.obtenerNotificaciones.mockReturnValue(of(page([n(), n(2, true)])));
    api.obtenerCantidadNoLeidas.mockReturnValue(of({ count: 1 }));
    abrir();
    expect(fixture.nativeElement.querySelectorAll('.navbar__notification-item').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.navbar__notification-item--unread').length).toBe(1);
    const lectura = new Subject<void>();
    api.marcarComoLeida.mockReturnValue(lectura);
    component.marcarNotificacion(component.notificaciones()[0]);
    expect(component.notificaciones()[0].leida).toBe(false);
    api.obtenerNotificaciones.mockReturnValue(of(page([n(1, true), n(2, true)])));
    api.obtenerCantidadNoLeidas.mockReturnValue(of({ count: 0 }));
    lectura.next(); lectura.complete();
    expect(component.notificaciones()[0].leida).toBe(true);
    expect(component.noLeidas()).toBe(0);
    expect(api.marcarComoLeida).toHaveBeenCalledWith(1);
  });

  it('no muestra éxito ante error al marcar una o todas', () => {
    api.obtenerNotificaciones.mockReturnValue(of(page([n()])));
    api.obtenerCantidadNoLeidas.mockReturnValue(of({ count: 1 }));
    abrir();
    api.marcarComoLeida.mockReturnValue(throwError(() => new Error('fallo')));
    api.marcarTodasComoLeidas.mockReturnValue(throwError(() => new Error('fallo')));
    component.marcarNotificacion(n());
    component.marcarTodasNotificaciones(); fixture.detectChanges();
    expect(component.notificaciones()[0].leida).toBe(false);
    expect(component.noLeidas()).toBe(1);
    expect(query('[role="alert"]')!.textContent).toContain('No se pudo guardar');
  });

  it('marca todas y reconcilia lista/contador', () => {
    api.obtenerNotificaciones.mockReturnValue(of(page([n()])));
    api.obtenerCantidadNoLeidas.mockReturnValue(of({ count: 1 }));
    abrir();
    api.obtenerNotificaciones.mockReturnValue(of(page([n(1, true)])));
    api.obtenerCantidadNoLeidas.mockReturnValue(of({ count: 0 }));
    component.marcarTodasNotificaciones();
    expect(api.marcarTodasComoLeidas).toHaveBeenCalledTimes(1);
    expect(component.notificaciones().every(n => n.leida)).toBe(true);
    expect(component.noLeidas()).toBe(0);
  });

  it('concatena páginas sin duplicar y reinicia al reabrir', () => {
    api.obtenerNotificaciones.mockReturnValueOnce(of(page([n()], 0, true)))
      .mockReturnValueOnce(of(page([n(), n(2)], 1, false)));
    abrir();
    expect(query('.navbar__notifications-more')).toBeTruthy();
    query('.navbar__notifications-more')!.click(); fixture.detectChanges();
    expect(component.notificaciones().map(n => n.id)).toEqual([1, 2]);
    expect(query('.navbar__notifications-more')).toBeNull();
    abrir(); abrir();
    expect(api.obtenerNotificaciones).toHaveBeenLastCalledWith(0, 20);
  });

  it('traduce contenido y tiempo ES/EN, con fallback para tipos futuros', () => {
    api.obtenerNotificaciones.mockReturnValue(of(page([n()])));
    abrir();
    expect(query('.navbar__notification-item')!.textContent).toContain('Postulación aprobada');
    expect(component.tiempoRelativo(n().fechaCreacion)).toContain('2');
    TestBed.inject(LanguageService).setLanguage('en'); fixture.detectChanges();
    expect(query('.navbar__notification-item')!.textContent).toContain('Application approved');
    expect(component.tiempoRelativo(n().fechaCreacion)).toContain('ago');
    expect(component.tiempoRelativo(new Date(Date.now() - 86400000).toISOString())).toBe('yesterday');
    expect(component.textoNotificacion({ ...n(), tipo: 'FUTURO' }).mensaje).toBe('Fallback persistido');
  });

  it('polling único, refresca panel y se limpia al destruir', () => {
    expect(api.obtenerCantidadNoLeidas).toHaveBeenCalledTimes(1);
    usuario.set({ id: 1, nombre: 'Nombre actualizado', accessToken: 'token' }); fixture.detectChanges();
    vi.advanceTimersByTime(60000);
    expect(api.obtenerCantidadNoLeidas).toHaveBeenCalledTimes(3);
    abrir();
    vi.advanceTimersByTime(30000);
    expect(api.obtenerNotificaciones).toHaveBeenCalledTimes(2);
    fixture.destroy();
    const calls = api.obtenerCantidadNoLeidas.mock.calls.length;
    vi.advanceTimersByTime(60000);
    expect(api.obtenerCantidadNoLeidas).toHaveBeenCalledTimes(calls);
  });

  it('evita solapamiento y continúa polling después de un error', () => {
    api.obtenerCantidadNoLeidas.mockReturnValueOnce(throwError(() => new Error('red')));
    vi.advanceTimersByTime(30000);
    const pendiente = new Subject<{ count: number }>();
    api.obtenerCantidadNoLeidas.mockReturnValueOnce(pendiente);
    vi.advanceTimersByTime(90000);
    expect(api.obtenerCantidadNoLeidas).toHaveBeenCalledTimes(3);
    pendiente.next({ count: 2 }); pendiente.complete();
    vi.advanceTimersByTime(30000);
    expect(api.obtenerCantidadNoLeidas).toHaveBeenCalledTimes(4);
  });

  it('logout cancela respuestas tardías y limpia el buzón', () => {
    const pendiente = new Subject<NotificacionesPage>();
    api.obtenerNotificaciones.mockReturnValue(pendiente);
    abrir();
    component.cerrarSesion(); fixture.detectChanges();
    pendiente.next(page([n()])); pendiente.complete();
    vi.advanceTimersByTime(60000);
    expect(component.notificaciones()).toEqual([]);
    expect(component.noLeidas()).toBe(0);
    expect(component.notificacionesAbiertas()).toBe(false);
  });

  it('cambio de usuario descarta respuestas anteriores y expiración detiene polling', () => {
    const pendiente = new Subject<NotificacionesPage>();
    api.obtenerNotificaciones.mockReturnValue(pendiente);
    abrir();
    usuario.set({ id: 2, nombre: 'Otro', accessToken: 'otro' }); fixture.detectChanges();
    pendiente.next(page([n()])); pendiente.complete();
    expect(component.notificaciones()).toEqual([]);
    sesionValida = false;
    vi.advanceTimersByTime(30000);
    expect(component.noLeidas()).toBe(0);
    const calls = api.obtenerCantidadNoLeidas.mock.calls.length;
    vi.advanceTimersByTime(30000);
    expect(api.obtenerCantidadNoLeidas).toHaveBeenCalledTimes(calls);
  });

  it('401 detiene consultas y limpia datos', () => {
    api.obtenerCantidadNoLeidas.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    vi.advanceTimersByTime(30000);
    const calls = api.obtenerCantidadNoLeidas.mock.calls.length;
    vi.advanceTimersByTime(60000);
    expect(api.obtenerCantidadNoLeidas).toHaveBeenCalledTimes(calls);
    expect(component.notificaciones()).toEqual([]);
  });
});
