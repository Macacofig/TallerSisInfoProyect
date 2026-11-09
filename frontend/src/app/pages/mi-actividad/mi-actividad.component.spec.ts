import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../config/app-config';
import { ActividadEstudiante, EstadoActividad } from '../../models/actividad-estudiante.model';
import { LoginResponse } from '../../models/login';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { MiActividadComponent } from './mi-actividad.component';

describe('MiActividadComponent', () => {
  let fixture: ComponentFixture<MiActividadComponent>;
  let http: HttpTestingController;
  let auth: AuthService;
  let language: LanguageService;
  let consulta: TestRequest;
  const url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.ACTIVIDAD_ESTUDIANTE}/estudiante`;
  const estados: EstadoActividad[] = ['RECHAZADA', 'PENDIENTE', 'REALIZADO', 'APROBADA'];
  const actividades: ActividadEstudiante[] = estados.map((estado, indice) => ({
    id: 504 - indice, idEstudiante: 41, titulo: `Actividad real ${indice}`,
    descripcion: `Descripción original ${indice}: Cálculo I`,
    fechaHoraRegistro: '2026-11-08T23:30:00.123456', estado
  }));

  function usuario(id = 41): LoginResponse {
    const payload = btoa(JSON.stringify({ studentId: id, exp: Math.floor(Date.now() / 1000) + 3600 }));
    return {
      id, nombre: id === 41 ? 'Lucía Pérez' : 'Pedro Gómez', carrera: 'Ingeniería de Sistemas',
      correoElectronico: 'usuario@test.invalid', telefono: '71234567', accessToken: `header.${payload}.signature`
    };
  }

  beforeEach(async () => {
    localStorage.removeItem('usuario');
    await TestBed.configureTestingModule({
      imports: [MiActividadComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    language = TestBed.inject(LanguageService);
    language.setLanguage('es');
    auth.guardarUsuario(usuario());
    fixture = TestBed.createComponent(MiActividadComponent);
    fixture.detectChanges();
    consulta = http.expectOne(`${url}/41`);
  });

  afterEach(() => {
    fixture.destroy();
    auth.cerrarSesion();
    http.verify();
  });

  it('anuncia la carga y muestra nombre y carrera de la sesión sin semestre', () => {
    const pantalla = fixture.nativeElement as HTMLElement;
    expect(pantalla.querySelector('[role="status"]')?.textContent).toContain('Cargando tu actividad');
    expect(pantalla.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(pantalla.textContent).toContain('Lucía Pérez');
    expect(pantalla.textContent).toContain('Ingeniería de Sistemas');
    expect(pantalla.textContent).not.toMatch(/semestre|semester/i);
    expect(pantalla.querySelector('h1')?.textContent).toBe('Mi actividad');
    expect(pantalla.querySelector('h2')?.textContent).toBe('Bitácora');
  });

  it('actualiza la vista reactiva con los cuatro estados y conserva orden y contenido', async () => {
    consulta.flush(actividades);
    await fixture.whenStable();

    const pantalla = fixture.nativeElement as HTMLElement;
    expect(Array.from(pantalla.querySelectorAll('h3'), h => h.textContent))
      .toEqual(actividades.map(a => a.titulo));
    expect(Array.from(pantalla.querySelectorAll('.actividad__badge'), b => b.textContent?.trim()))
      .toEqual(['Rechazada', 'Pendiente', 'Realizado', 'Aprobada']);
    for (const actividad of actividades) expect(pantalla.textContent).toContain(actividad.descripcion);
    expect(pantalla.querySelector('[aria-busy="false"]')).not.toBeNull();
    expect(pantalla.textContent).not.toMatch(/demostración|fictici|pagin|semestre/i);
    expect(pantalla.querySelectorAll('button, input, textarea, select').length).toBe(0);
  });

  it('muestra vacío sin inventar registros', async () => {
    consulta.flush([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent)
      .toContain('Todavía no tienes actividades registradas.');
    expect(fixture.nativeElement.querySelectorAll('.actividad__row').length).toBe(0);
  });

  it.each([401, 403, 500])('anuncia el error %s y permite reintentar', async status => {
    consulta.flush({}, { status, statusText: 'Error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('No se pudo cargar');
    const boton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(boton.textContent).toBe('Reintentar');
    boton.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Cargando tu actividad');
    http.expectOne(`${url}/41`).flush(actividades);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.actividad__row').length).toBe(4);
  });

  it('cambia ES/EN sin traducir el contenido real ni volver a consultar', async () => {
    consulta.flush(actividades);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('time')?.textContent).toBe('08/11/2026, 23:30');

    language.setLanguage('en');
    await fixture.whenStable();
    const pantalla = fixture.nativeElement as HTMLElement;
    expect(pantalla.querySelector('h1')?.textContent).toBe('My activity');
    expect(pantalla.querySelector('h2')?.textContent).toBe('Activity log');
    expect(pantalla.querySelector('time')?.textContent).toBe('11/08/2026, 23:30');
    expect(pantalla.querySelector('time')?.getAttribute('datetime')).toBe('2026-11-08T23:30:00.123456');
    expect(Array.from(pantalla.querySelectorAll('.actividad__badge'), b => b.textContent?.trim()))
      .toEqual(['Rejected', 'Pending', 'Completed', 'Approved']);
    for (const actividad of actividades) {
      expect(pantalla.textContent).toContain(actividad.titulo);
      expect(pantalla.textContent).toContain(actividad.descripcion);
    }
    http.expectNone(() => true);
  });

  it('traduce carga, error, reintento y vacío', async () => {
    language.setLanguage('en');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Loading your activity');
    consulta.flush({}, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Your activity could not be loaded');
    const boton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(boton.textContent).toBe('Try again');
    boton.click();
    await fixture.whenStable();
    http.expectOne(`${url}/41`).flush([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('You have no recorded activities yet.');
  });

  it('muestra fecha no disponible sin romper el resto de la fila', async () => {
    consulta.flush([{ ...actividades[0], fechaHoraRegistro: '2026-02-30T12:00:00' }]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Fecha no disponible');
    expect(fixture.nativeElement.textContent).toContain(actividades[0].titulo);
    expect(fixture.nativeElement.querySelector('time')).toBeNull();
    language.setLanguage('en');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Date unavailable');
  });

  it('cancela la petición pendiente al cambiar de usuario', async () => {
    auth.guardarUsuario(usuario(73));
    await fixture.whenStable();
    expect(consulta.cancelled).toBe(true);
    expect(() => consulta.flush(actividades)).toThrow();
    expect(fixture.nativeElement.textContent).not.toContain('Lucía Pérez');
    const nueva = http.expectOne(`${url}/73`);
    nueva.flush([{ ...actividades[0], idEstudiante: 73, titulo: 'Actividad de Pedro' }]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Pedro Gómez');
    expect(fixture.nativeElement.textContent).toContain('Actividad de Pedro');
  });

  it('oculta los datos previos antes de cargar la nueva sesión', async () => {
    consulta.flush(actividades);
    await fixture.whenStable();
    auth.guardarUsuario(usuario(73));
    expect(fixture.componentInstance.vista().actividades).toEqual([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.actividad__row').length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Cargando tu actividad');
    http.expectOne(`${url}/73`).flush([]);
  });

  it.each(['respuesta', 'error'])('ignora una %s tardía antes de procesar el cambio de sesión', async caso => {
    auth.guardarUsuario(usuario(73));
    if (caso === 'respuesta') consulta.flush(actividades);
    else consulta.flush({}, { status: 500, statusText: 'Error' });
    expect(fixture.componentInstance.vista().actividades).toEqual([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Actividad real');
    http.expectOne(`${url}/73`).flush([]);
  });

  it('cierra la sesión limpiando la pantalla y cancelando la consulta', async () => {
    auth.cerrarSesion();
    expect(fixture.componentInstance.vista().actividades).toEqual([]);
    await fixture.whenStable();
    expect(consulta.cancelled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Inicia sesión para consultar tu actividad.');
    expect(fixture.nativeElement.textContent).not.toContain('Lucía Pérez');
    expect(fixture.nativeElement.querySelectorAll('.actividad__row').length).toBe(0);
    http.expectNone(() => true);
  });

  it('limpia también los resultados ya cargados al cerrar sesión', async () => {
    consulta.flush(actividades);
    await fixture.whenStable();
    auth.cerrarSesion();
    expect(fixture.componentInstance.vista().actividades).toEqual([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Actividad real');
    http.expectNone(() => true);
  });

  it('cancela la consulta al destruir la pantalla', () => {
    fixture.destroy();
    expect(consulta.cancelled).toBe(true);
    expect(() => consulta.flush(actividades)).toThrow();
  });

  it('muestra texto del backend sin interpretarlo como HTML', async () => {
    const descripcion = '<img src=x onerror="alert(1)">';
    consulta.flush([{ ...actividades[0], descripcion }]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(descripcion);
    expect(fixture.nativeElement.querySelector('.actividad__body img')).toBeNull();
  });
});
