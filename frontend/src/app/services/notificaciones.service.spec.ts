import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../config/app-config';
import { AuthService } from './auth.service';
import { NotificacionesService } from './notificaciones.service';

describe('NotificacionesService', () => {
  let http: HttpTestingController;
  let service: NotificacionesService;
  const url = `${APP_CONFIG.API.BASE_URL}/notificaciones`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), {
      provide: AuthService, useValue: {
        obtenerHeadersAutenticacion: () => new HttpHeaders({ Authorization: 'Bearer prueba' })
      }
    }] });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(NotificacionesService);
  });
  afterEach(() => http.verify());

  it('lista con página, tamaño y Bearer', () => {
    service.obtenerNotificaciones(2, 20).subscribe();
    const r = http.expectOne(`${url}?page=2&size=20`);
    expect(r.request.method).toBe('GET');
    expect(r.request.headers.get('Authorization')).toBe('Bearer prueba');
    r.flush({ content: [], page: 2, size: 20, hasMore: false, totalElements: 0 });
  });

  it('consulta contador autenticado', () => {
    const next = vi.fn();
    service.obtenerCantidadNoLeidas().subscribe(next);
    const r = http.expectOne(`${url}/no-leidas/count`);
    expect(r.request.headers.get('Authorization')).toBe('Bearer prueba');
    r.flush({ count: 4 });
    expect(next).toHaveBeenCalledWith({ count: 4 });
  });

  it('marca una y todas mediante POST autenticado', () => {
    service.marcarComoLeida(7).subscribe();
    service.marcarTodasComoLeidas().subscribe();
    for (const endpoint of ['/7/leer', '/leer-todas']) {
      const r = http.expectOne(url + endpoint);
      expect(r.request.method).toBe('POST');
      expect(r.request.headers.get('Authorization')).toBe('Bearer prueba');
      expect(r.request.body).toBeNull();
      r.flush(null, { status: 204, statusText: 'No Content' });
    }
  });

  it.each([401, 404, 500])('propaga errores HTTP %s', status => {
    const error = vi.fn();
    service.obtenerNotificaciones().subscribe({ error });
    http.expectOne(`${url}?page=0&size=20`).flush({}, { status, statusText: 'Error' });
    expect(error.mock.calls[0][0].status).toBe(status);
  });
});
