import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TimeoutError } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { ActividadEstudiante } from '../models/actividad-estudiante.model';
import { LoginResponse } from '../models/login';
import { ActividadEstudianteService } from './actividad-estudiante.service';
import { AuthService } from './auth.service';

describe('ActividadEstudianteService', () => {
  let http: HttpTestingController;
  let service: ActividadEstudianteService;
  let auth: AuthService;
  const url = `${APP_CONFIG.API.BASE_URL}/actividad-estudiante/estudiante`;

  function usuario(id = 41, vigenciaSegundos = 3600): LoginResponse {
    const payload = btoa(JSON.stringify({
      studentId: id,
      exp: Math.floor(Date.now() / 1000) + vigenciaSegundos
    }));
    return {
      id, nombre: 'Ana', telefono: '71234567', carrera: 'Sistemas',
      correoElectronico: 'ana@test.invalid', accessToken: `header.${payload}.signature`
    };
  }

  beforeEach(() => {
    localStorage.removeItem('usuario');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    service = TestBed.inject(ActividadEstudianteService);
    auth.guardarUsuario(usuario());
  });

  afterEach(() => {
    vi.useRealTimers();
    auth.cerrarSesion();
    http.verify();
  });

  it('consulta el ID de la sesión con GET, Bearer y sin paginación', () => {
    service.obtenerMiActividad().subscribe();

    const request = http.expectOne(`${url}/41`);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${auth.obtenerUsuario()!.accessToken}`);
    expect(request.request.headers.get('Content-Type')).toBe('application/json');
    expect(request.request.params.keys()).toEqual([]);
    expect(request.request.body).toBeNull();
    request.flush([]);
  });

  it('devuelve el arreglo completo sin transformar fechas ni datos', () => {
    const actividades: ActividadEstudiante[] = [
      {
        id: 501, idEstudiante: 41, titulo: 'Calificar materia', descripcion: 'Calificación a materia',
        fechaHoraRegistro: '2026-11-08T10:30:00.123456', estado: 'REALIZADO'
      },
      {
        id: 502, idEstudiante: 41, titulo: 'Solicitar ser ayudante en Cálculo I',
        descripcion: 'Solicitud enviada a ser probada',
        fechaHoraRegistro: '2026-11-07T23:30:00', estado: 'PENDIENTE'
      }
    ];
    const next = vi.fn();
    service.obtenerMiActividad().subscribe(next);
    http.expectOne(`${url}/41`).flush(actividades);

    expect(next).toHaveBeenCalledExactlyOnceWith(actividades);
  });

  it('devuelve un arreglo vacío sin inventar actividades', () => {
    const next = vi.fn();
    service.obtenerMiActividad().subscribe(next);
    http.expectOne(`${url}/41`).flush([]);

    expect(next).toHaveBeenCalledExactlyOnceWith([]);
  });

  it.each([401, 403, 500])('propaga el error HTTP %s sin cambiarlo', status => {
    const error = vi.fn();
    const next = vi.fn();
    const body = { mensaje: 'Error del servidor' };
    service.obtenerMiActividad().subscribe({ next, error });
    http.expectOne(`${url}/41`).flush(body, { status, statusText: 'Error' });

    expect(next).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledExactlyOnceWith(expect.any(HttpErrorResponse));
    expect(error.mock.calls[0][0].status).toBe(status);
    expect(error.mock.calls[0][0].error).toEqual(body);
  });

  it('aplica el timeout configurado y cancela la petición pendiente', () => {
    vi.useFakeTimers();
    const error = vi.fn();
    service.obtenerMiActividad().subscribe({ error });
    const request = http.expectOne(`${url}/41`);

    vi.advanceTimersByTime(APP_CONFIG.TIMEOUTS.API_REQUEST - 1);
    expect(error).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(error).toHaveBeenCalledExactlyOnceWith(expect.any(TimeoutError));
    expect(request.cancelled).toBe(true);
  });

  it('sin usuario devuelve error de sesión sin realizar HTTP', () => {
    auth.cerrarSesion();
    const error = vi.fn();
    service.obtenerMiActividad().subscribe({ error });

    expect(error).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ status: 401 }));
    http.expectNone(() => true);
  });

  it('con sesión vencida devuelve error sin realizar HTTP', () => {
    auth.guardarUsuario(usuario(41, -60));
    const error = vi.fn();
    service.obtenerMiActividad().subscribe({ error });

    expect(error).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ status: 401 }));
    http.expectNone(() => true);
  });

  it('no realiza peticiones antes de suscribirse', () => {
    service.obtenerMiActividad();

    http.expectNone(() => true);
  });

  it('cada nueva consulta utiliza el usuario y token actuales', () => {
    service.obtenerMiActividad().subscribe();
    http.expectOne(`${url}/41`).flush([]);

    const otroUsuario = usuario(73);
    auth.guardarUsuario(otroUsuario);
    service.obtenerMiActividad().subscribe();
    const request = http.expectOne(`${url}/73`);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${otroUsuario.accessToken}`);
    request.flush([]);
    http.expectNone(`${url}/41`);
  });

  it('resuelve la sesión al suscribirse y no conserva una identidad anterior', () => {
    const consulta = service.obtenerMiActividad();
    auth.guardarUsuario(usuario(73));
    consulta.subscribe();
    http.expectOne(`${url}/73`).flush([]);

    auth.cerrarSesion();
    const error = vi.fn();
    consulta.subscribe({ error });
    expect(error).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ status: 401 }));
    http.expectNone(() => true);
  });
});
