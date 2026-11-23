import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG } from '../../config/app-config';
import { MaterialEstudiante } from '../../models/material-estudiante.model';
import { LoginResponse } from '../../models/login';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { MisMateriales } from './mis-materiales';

describe('MisMateriales', () => {
  let fixture: ComponentFixture<MisMateriales>;
  let http: HttpTestingController;
  let auth: AuthService;
  let language: LanguageService;
  let token: string;
  const url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.MIS_MATERIALES}`;
  const materiales: MaterialEstudiante[] = [
    { id: 11, titulo: 'Álgebra Lineal', materia: 'Matemática', tipo: 'PDF', estado: 'PENDIENTE' },
    { id: 12, titulo: 'Cálculo I', materia: 'Matemática', tipo: 'WORD', estado: 'APROBADO' },
    { id: 13, titulo: 'Guía rechazada', materia: null, tipo: null, estado: 'NEGADO' }
  ];

  function usuario(id = 41): LoginResponse {
    const payload = btoa(JSON.stringify({ studentId: id, exp: Math.floor(Date.now() / 1000) + 3600 }));
    token = `header.${payload}.signature`;
    return {
      id, nombre: id === 41 ? 'Lucía Pérez' : 'Pedro Gómez', carrera: 'Ingeniería de Sistemas',
      correoElectronico: 'usuario@test.invalid', telefono: '71234567', accessToken: token
    };
  }

  beforeEach(async () => {
    localStorage.removeItem('usuario');
    await TestBed.configureTestingModule({
      imports: [MisMateriales],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    language = TestBed.inject(LanguageService);
    language.setLanguage('es');
    auth.guardarUsuario(usuario());
    fixture = TestBed.createComponent(MisMateriales);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    auth.cerrarSesion();
    http.verify();
  });

  it('consulta solo la ruta autenticada, sin enviar un ID de estudiante en la URL', () => {
    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    request.flush(materiales);
  });

  it('muestra los tres estados y conserva los datos de solicitudes rechazadas sin material', async () => {
    http.expectOne(url).flush(materiales);
    await fixture.whenStable();

    const pantalla = fixture.nativeElement as HTMLElement;
    expect(pantalla.querySelector('h1')?.textContent).toBe('Mis materiales');
    expect(Array.from(pantalla.querySelectorAll('.mis-materiales__badge'), badge => badge.textContent?.trim()))
      .toEqual(['Pendiente', 'Aprobado', 'Rechazado']);
    expect(Array.from(pantalla.querySelectorAll('h3'), titulo => titulo.textContent))
      .toEqual(materiales.map(material => material.titulo));
    expect(pantalla.textContent).toContain('No disponible');
    expect(pantalla.textContent).toContain('Lucía Pérez');
  });

  it('busca títulos sin distinguir acentos y filtra por estado', async () => {
    http.expectOne(url).flush(materiales);
    await fixture.whenStable();

    const busqueda = fixture.nativeElement.querySelector('#material-titulo') as HTMLInputElement;
    busqueda.value = 'algebra';
    busqueda.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.mis-materiales__row').length).toBe(1);
    expect(fixture.nativeElement.querySelector('h3')?.textContent).toBe('Álgebra Lineal');

    busqueda.value = '';
    busqueda.dispatchEvent(new Event('input'));
    const filtro = fixture.nativeElement.querySelector('#material-estado') as HTMLSelectElement;
    filtro.value = 'NEGADO';
    filtro.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.mis-materiales__row').length).toBe(1);
    expect(fixture.nativeElement.querySelector('h3')?.textContent).toBe('Guía rechazada');
  });

  it('traduce etiquetas, filtros y mensajes al cambiar el idioma', async () => {
    http.expectOne(url).flush(materiales);
    await fixture.whenStable();
    language.setLanguage('en');
    await fixture.whenStable();

    const pantalla = fixture.nativeElement as HTMLElement;
    expect(pantalla.querySelector('h1')?.textContent).toBe('My materials');
    expect(Array.from(pantalla.querySelectorAll('.mis-materiales__badge'), badge => badge.textContent?.trim()))
      .toEqual(['Pending', 'Approved', 'Rejected']);
    expect(pantalla.textContent).toContain('Subject');
    http.expectNone(() => true);
  });

  it('muestra el estado vacío y el error con reintento', async () => {
    http.expectOne(url).flush([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent)
      .toContain('Todavía no has enviado materiales.');

    fixture.componentInstance.reintentar();
    await fixture.whenStable();
    http.expectOne(url).flush({}, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('No se pudieron cargar tus materiales');
  });
});
