import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TimeoutError } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import { ErrorAuth, RegistroRequest, RegistroResponse } from '../models/registrar';
import { AuthService, mapearErrorHttp } from './auth.service';

// El servicio hace peticiones HTTP reales: las pruebas usan HttpTestingController
// (no un mock propio) para interceptar esas peticiones.
describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.AUTH_REGISTER}`;

  const datos: RegistroRequest = {
    nombre: 'Ana Torres',
    carrera: 'Ingeniería de Sistemas',
    correoElectronico: 'ana.torres@ucb.edu.bo',
    contrasena: 'secreta1',
    telefono: '71234567'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it(`envía POST ${APP_CONFIG.API.ENDPOINTS.AUTH_REGISTER} con JSON y sin semestre`, () => {
    const siguiente = vi.fn();
    service.registerUser(datos).subscribe(siguiente);

    const peticion = http.expectOne({ method: 'POST', url });
    expect(peticion.request.headers.get('Content-Type')).toBe('application/json');
    expect(peticion.request.body).toEqual(datos);
    expect(peticion.request.body).not.toHaveProperty('semestre');

    const respuesta: RegistroResponse = {
      id: 1,
      nombre: datos.nombre,
      telefono: datos.telefono,
      correoElectronico: datos.correoElectronico,
      carrera: datos.carrera
    };
    peticion.flush(respuesta, { status: 201, statusText: 'Created' });
    expect(siguiente).toHaveBeenCalledWith(respuesta);
  });

  it('nunca imprime la contraseña en consola', () => {
    const espia = vi.spyOn(console, 'log').mockImplementation(() => {});
    service.registerUser(datos).subscribe();
    http.expectOne(url).flush({ id: 1, ...datos }, { status: 201, statusText: 'Created' });
    expect(espia).not.toHaveBeenCalledWith(expect.stringContaining('secreta1'));
    espia.mockRestore();
  });

  it('409 → CORREO_DUPLICADO', () => {
    const error = vi.fn();
    service.registerUser(datos).subscribe({ error });
    http.expectOne(url).flush('Conflicto', { status: 409, statusText: 'Conflict' });
    expect(error).toHaveBeenCalledWith({ codigo: 'CORREO_DUPLICADO', estado: 409 } satisfies ErrorAuth);
  });

  it('400 → VALIDACION, con errores por campo si el servidor los envía', () => {
    const error = vi.fn();
    service.registerUser(datos).subscribe({ error });
    http.expectOne(url).flush(
      { errores: { telefono: 'El teléfono ya está en uso.' } },
      { status: 400, statusText: 'Bad Request' }
    );
    expect(error).toHaveBeenCalledWith({
      codigo: 'VALIDACION',
      estado: 400,
      campos: { telefono: 'El teléfono ya está en uso.' }
    } satisfies ErrorAuth);
  });

  it('500 → SERVIDOR', () => {
    const error = vi.fn();
    service.registerUser(datos).subscribe({ error });
    http.expectOne(url).flush('Error', { status: 500, statusText: 'Internal Server Error' });
    expect(error).toHaveBeenCalledWith({ codigo: 'SERVIDOR', estado: 500 } satisfies ErrorAuth);
  });

  it('sin red (status 0) → SIN_CONEXION', () => {
    const error = vi.fn();
    service.registerUser(datos).subscribe({ error });
    http.expectOne(url).error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    expect(error).toHaveBeenCalledWith({ codigo: 'SIN_CONEXION', estado: 0 } satisfies ErrorAuth);
  });
});

// La traducción de errores HTTP está probada por separado, de forma unitaria.
describe('mapearErrorHttp', () => {
  it('400 → VALIDACION, con errores por campo si el servidor los envía', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { errores: { correoElectronico: 'Correo no permitido.', otro: 5 } }
    });
    expect(mapearErrorHttp(error)).toEqual({
      codigo: 'VALIDACION',
      estado: 400,
      campos: { correoElectronico: 'Correo no permitido.' }
    });
  });

  it('400 sin detalle por campo → VALIDACION sin campos', () => {
    const resultado = mapearErrorHttp(new HttpErrorResponse({ status: 400, error: 'Bad Request' }));
    expect(resultado).toEqual({ codigo: 'VALIDACION', estado: 400, campos: undefined });
  });

  it('409 → CORREO_DUPLICADO', () => {
    expect(mapearErrorHttp(new HttpErrorResponse({ status: 409 }))).toEqual({ codigo: 'CORREO_DUPLICADO', estado: 409 });
  });

  it('500 → SERVIDOR', () => {
    expect(mapearErrorHttp(new HttpErrorResponse({ status: 500 }))).toEqual({ codigo: 'SERVIDOR', estado: 500 });
  });

  it('status 0 (sin red o backend apagado) → SIN_CONEXION', () => {
    expect(mapearErrorHttp(new HttpErrorResponse({ status: 0 }))).toEqual({ codigo: 'SIN_CONEXION', estado: 0 });
  });

  it('TimeoutError → TIEMPO_AGOTADO', () => {
    expect(mapearErrorHttp(new TimeoutError())).toEqual({ codigo: 'TIEMPO_AGOTADO', estado: 0 });
  });

  it('cualquier otro error → SERVIDOR', () => {
    expect(mapearErrorHttp(new Error('algo raro'))).toEqual({ codigo: 'SERVIDOR', estado: 0 });
  });
});

