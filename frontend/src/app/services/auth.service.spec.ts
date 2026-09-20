import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TimeoutError } from 'rxjs';

import { ErrorAuth, RegistroRequest, RegistroResponse } from '../models/auth.model';
import { AuthService, mapearErrorHttp } from './auth.service';

// Pruebas del servicio con el MOCK activo (no dependen del backend real).
describe('AuthService (mock)', () => {
  let service: AuthService;

  const datos: RegistroRequest = {
    nombre: 'Ana Torres',
    carrera: 'Ingeniería de Sistemas',
    correoElectronico: 'ana.torres@ucb.edu.bo',
    contrasena: 'secreta1',
    telefono: null
  };

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => vi.useRealTimers());

  it('espera ~1 segundo y luego devuelve éxito con los datos del usuario', async () => {
    const siguiente = vi.fn();
    service.registerUser(datos).subscribe(siguiente);

    await vi.advanceTimersByTimeAsync(999);
    expect(siguiente).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(siguiente).toHaveBeenCalledOnce();
    const respuesta = siguiente.mock.calls[0][0] as RegistroResponse;
    expect(respuesta.nombre).toBe('Ana Torres');
    expect(respuesta.correoElectronico).toBe('ana.torres@ucb.edu.bo');
  });

  it('nunca devuelve la contraseña en la respuesta', async () => {
    const siguiente = vi.fn();
    service.registerUser(datos).subscribe(siguiente);
    await vi.advanceTimersByTimeAsync(1000);

    expect(JSON.stringify(siguiente.mock.calls[0][0])).not.toContain('secreta1');
  });

  it.each(['test@ucb.edu.bo', 'test@universidad.edu', '  TEST@UCB.EDU.BO '])(
    'simula un 409 (correo ya registrado) para %s',
    async (correo) => {
      const siguiente = vi.fn();
      const error = vi.fn();
      service.registerUser({ ...datos, correoElectronico: correo }).subscribe({ next: siguiente, error });

      await vi.advanceTimersByTimeAsync(1000);

      expect(siguiente).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledWith({ codigo: 'CORREO_DUPLICADO', estado: 409 } satisfies ErrorAuth);
    }
  );
});

// La traducción de errores HTTP está activa y probada aunque el mock no la use.
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

// =============================================================================
// TODO (BACKEND): TESTS DE INTEGRACIÓN — descomentar cuando el endpoint
// /api/auth/register esté listo y se haya activado el código real en
// auth.service.ts (paso 3 de la guía). Además hay que importar:
//   import { provideHttpClient } from '@angular/common/http';
//   import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
//   import { APP_CONFIG } from '../config/app-config';
// =============================================================================
//
// describe('AuthService (backend real - contrato HTTP)', () => {
//   let service: AuthService;
//   let http: HttpTestingController;
//   const url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.AUTH_REGISTER}`;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
//     service = TestBed.inject(AuthService);
//     http = TestBed.inject(HttpTestingController);
//   });
//
//   afterEach(() => http.verify());
//
//   it('envía POST /api/auth/register con JSON y sin semestre', () => {
//     service.registerUser(datos).subscribe();
//     const peticion = http.expectOne({ method: 'POST', url });
//     expect(peticion.request.headers.get('Content-Type')).toBe('application/json');
//     expect(peticion.request.body).toEqual(datos);
//     expect(peticion.request.body).not.toHaveProperty('semestre');
//     peticion.flush({ id: 1, nombre: datos.nombre, correoElectronico: datos.correoElectronico }, { status: 201, statusText: 'Created' });
//   });
//
//   it('409 → CORREO_DUPLICADO', () => {
//     const error = vi.fn();
//     service.registerUser(datos).subscribe({ error });
//     http.expectOne(url).flush('Conflicto', { status: 409, statusText: 'Conflict' });
//     expect(error).toHaveBeenCalledWith({ codigo: 'CORREO_DUPLICADO', estado: 409 });
//   });
//
//   it('400 → VALIDACION con errores por campo', () => {
//     const error = vi.fn();
//     service.registerUser(datos).subscribe({ error });
//     http.expectOne(url).flush({ errores: { nombre: 'Muy corto' } }, { status: 400, statusText: 'Bad Request' });
//     expect(error).toHaveBeenCalledWith({ codigo: 'VALIDACION', estado: 400, campos: { nombre: 'Muy corto' } });
//   });
//
//   it('500 → SERVIDOR', () => {
//     const error = vi.fn();
//     service.registerUser(datos).subscribe({ error });
//     http.expectOne(url).flush('Error', { status: 500, statusText: 'Internal Server Error' });
//     expect(error).toHaveBeenCalledWith({ codigo: 'SERVIDOR', estado: 500 });
//   });
// });
//
// // Prueba manual contra el backend levantado en http://localhost:8081 (no correr en CI).
// // Usar un correo distinto en cada corrida o el backend responderá 409.
// describe.skip('Integración real: POST /api/auth/register', () => {
//   it('crea un usuario y responde 201', async () => {
//     const respuesta = await fetch(`${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.AUTH_REGISTER}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ ...datos, correoElectronico: `prueba.${Date.now()}@ucb.edu.bo` })
//     });
//     expect(respuesta.status).toBe(201);
//   });
// });
