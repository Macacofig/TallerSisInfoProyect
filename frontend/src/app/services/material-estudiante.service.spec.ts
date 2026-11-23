import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../config/app-config';
import { LoginResponse } from '../models/login';
import { MaterialEstudiante } from '../models/material-estudiante.model';
import { AuthService } from './auth.service';
import { MaterialEstudianteService } from './material-estudiante.service';

describe('MaterialEstudianteService', () => {
  let service: MaterialEstudianteService;
  let auth: AuthService;
  let http: HttpTestingController;
  const url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.MIS_MATERIALES}`;

  function usuario(id = 41): LoginResponse {
    const payload = btoa(JSON.stringify({
      studentId: id,
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    return {
      id, nombre: 'Ana', carrera: 'Sistemas', telefono: '71234567',
      correoElectronico: 'ana@test.invalid', accessToken: `header.${payload}.signature`
    };
  }

  beforeEach(() => {
    localStorage.removeItem('usuario');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MaterialEstudianteService);
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    auth.cerrarSesion();
    http.verify();
  });

  it('requiere sesión válida y no hace solicitudes cuando no hay sesión', () => {
    const error = vi.fn();
    service.obtenerMisMateriales().subscribe({ error });

    expect(error).toHaveBeenCalledOnce();
    expect(error.mock.calls[0][0].status).toBe(401);
    http.expectNone(() => true);
  });

  it('consulta solo la ruta autenticada, sin aceptar un ID de estudiante del cliente', () => {
    const sesion = usuario();
    auth.guardarUsuario(sesion);
    service.obtenerMisMateriales().subscribe();

    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${sesion.accessToken}`);
    expect(request.request.params.keys()).toEqual([]);
    request.flush([]);
  });

  it('devuelve los estados y los detalles disponibles sin transformar la respuesta', () => {
    const materiales: MaterialEstudiante[] = [
      { id: 1, titulo: 'Apunte', nombreMateria: 'Programación I', tipo: 'PDF', estado: 'PENDIENTE' },
      { id: 2, titulo: 'Resumen', nombreMateria: 'Cálculo I', tipo: 'WORD', estado: 'APROBADO' },
      { id: 3, titulo: 'Guía', nombreMateria: null, tipo: null, estado: 'NEGADO' }
    ];
    const next = vi.fn();
    auth.guardarUsuario(usuario());
    service.obtenerMisMateriales().subscribe(next);
    http.expectOne(url).flush(materiales);

    expect(next).toHaveBeenCalledExactlyOnceWith(materiales);
  });

  it('devuelve una lista vacía cuando el estudiante no tiene solicitudes', () => {
    const next = vi.fn();
    auth.guardarUsuario(usuario());
    service.obtenerMisMateriales().subscribe(next);
    http.expectOne(url).flush([]);

    expect(next).toHaveBeenCalledExactlyOnceWith([]);
  });

  it('propaga errores HTTP del endpoint', () => {
    const error = vi.fn();
    auth.guardarUsuario(usuario());
    service.obtenerMisMateriales().subscribe({ error });
    http.expectOne(url).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(error).toHaveBeenCalledExactlyOnceWith(expect.any(HttpErrorResponse));
    expect(error.mock.calls[0][0].status).toBe(401);
  });
});
