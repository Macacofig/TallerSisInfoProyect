import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { SplashComponent } from './splash.component';

describe('SplashComponent', () => {
  let api: { test: ReturnType<typeof vi.fn>; checkDatabase: ReturnType<typeof vi.fn> };
  let backendResponse: Subject<string>;
  let databaseResponse: Subject<{ status: 'UP' }>;
  let navigate: ReturnType<typeof vi.fn>;
  let hasSession: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    backendResponse = new Subject<string>();
    databaseResponse = new Subject<{ status: 'UP' }>();
    api = {
      test: vi.fn(() => backendResponse),
      checkDatabase: vi.fn(() => databaseResponse)
    };
    navigate = vi.fn().mockResolvedValue(true);
    hasSession = vi.fn().mockReturnValue(false);
    TestBed.configureTestingModule({
      imports: [SplashComponent],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: AuthService, useValue: { tieneSesionValida: hasSession } },
        { provide: Router, useValue: { navigate } }
      ]
    });
    TestBed.inject(LanguageService).setLanguage('es');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function flushFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  }

  function render(): { fixture: ComponentFixture<SplashComponent>; component: SplashComponent } {
    const fixture = TestBed.createComponent(SplashComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('muestra el splash inicial y la barra sin reportar progreso no comprobado', () => {
    const { fixture, component } = render();

    expect(fixture.nativeElement.textContent).toContain('Iniciando UniHub...');
    expect(fixture.nativeElement.querySelector('[role="progressbar"]')).toBeTruthy();
    expect(component.progress()).toBe(0);
    expect(api.test).not.toHaveBeenCalled();
  });

  it('marca el frontend listo y comprueba el backend después del primer render', async () => {
    const { fixture, component } = render();

    await flushFrame();
    fixture.detectChanges();
    expect(component.stage()).toBe('FRONTEND');
    expect(component.progress()).toBe(20);
    expect(fixture.nativeElement.textContent).toContain('Preparando frontend...');
    expect(api.test).not.toHaveBeenCalled();

    await flushFrame();
    expect(api.test).toHaveBeenCalledOnce();
    expect(component.stage()).toBe('BACKEND');
  });

  it('avanza a PostgreSQL únicamente después de responder el backend', async () => {
    const { component } = render();
    await flushFrame();
    await flushFrame();

    backendResponse.next('UniHub funcionando');

    expect(component.progress()).toBe(55);
    expect(component.stage()).toBe('DATABASE');
    expect(api.checkDatabase).toHaveBeenCalledOnce();
  });

  it('muestra el error de backend y no aumenta el progreso al fallar', async () => {
    const { fixture, component } = render();
    await flushFrame();
    await flushFrame();
    backendResponse.error(new Error('offline'));
    fixture.detectChanges();

    expect(component.progress()).toBe(20);
    expect(component.failedService()).toBe('backend');
    expect(fixture.nativeElement.textContent).toContain('No se pudo conectar con el servidor.');
    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Reintentar conexión');
  });

  it('marca PostgreSQL disponible solo con respuesta exitosa del endpoint de salud', async () => {
    const { fixture, component } = render();
    await flushFrame();
    await flushFrame();
    backendResponse.next('UniHub funcionando');

    databaseResponse.next({ status: 'UP' });
    fixture.detectChanges();

    expect(component.stage()).toBe('COMPLETE');
    expect(component.progress()).toBe(100);
    expect(fixture.nativeElement.textContent).toContain('Conexiones verificadas. Ingresando a UniHub...');
  });

  it('no llega al 100 % y ofrece reintento si PostgreSQL no responde', async () => {
    const { fixture, component } = render();
    await flushFrame();
    await flushFrame();
    backendResponse.next('UniHub funcionando');
    databaseResponse.error(new Error('database unavailable'));
    fixture.detectChanges();

    expect(component.progress()).toBe(55);
    expect(component.failedService()).toBe('database');
    expect(fixture.nativeElement.textContent).toContain('No se pudo verificar la conexión con la base de datos.');
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('reintenta el servicio que falló y continúa con el siguiente paso', async () => {
    const retryBackend = new Subject<string>();
    const retryDatabase = new Subject<{ status: 'UP' }>();
    api.test.mockReturnValueOnce(backendResponse).mockReturnValueOnce(retryBackend);
    api.checkDatabase.mockReturnValueOnce(databaseResponse).mockReturnValueOnce(retryDatabase);
    const { fixture, component } = render();
    await flushFrame();
    await flushFrame();
    backendResponse.error(new Error('offline'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();
    expect(api.test).toHaveBeenCalledTimes(2);
    retryBackend.next('UniHub funcionando');
    expect(api.checkDatabase).toHaveBeenCalledOnce();
    expect(component.stage()).toBe('DATABASE');
  });

  it('trata el timeout del backend como un fallo reintentable', async () => {
    const { fixture, component } = render();
    await flushFrame();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    await flushFrame();

    await vi.advanceTimersByTimeAsync(8000);
    fixture.detectChanges();

    expect(component.failedService()).toBe('backend');
    expect(component.progress()).toBe(20);
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
    vi.useRealTimers();
  });

  it('navega a registro cuando los servicios están listos y no hay sesión', async () => {
    const { fixture, component } = render();
    await flushFrame();
    await flushFrame();
    backendResponse.next('UniHub funcionando');
    databaseResponse.next({ status: 'UP' });

    expect(component.progress()).toBe(100);
    expect(navigate).not.toHaveBeenCalled();
    await flushFrame();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/registro'], { replaceUrl: true });
  });

  it('conserva una sesión válida y continúa a home', async () => {
    hasSession.mockReturnValue(true);
    render();
    await flushFrame();
    await flushFrame();
    backendResponse.next('UniHub funcionando');
    databaseResponse.next({ status: 'UP' });

    await flushFrame();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/home'], { replaceUrl: true });
  });
});
