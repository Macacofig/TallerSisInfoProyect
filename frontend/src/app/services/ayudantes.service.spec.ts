import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../config/app-config';
import { AuthService } from './auth.service';
import { AyudantesService } from './ayudantes.service';

describe('AyudantesService: registrar solicitud', () => {
  it('envía una única petición con JWT, IDs distintos y mensaje completo, sin estado', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), {
        provide: AuthService,
        useValue: { obtenerHeadersAutenticacion: () => new HttpHeaders({ Authorization: 'Bearer token-de-prueba' }) }
      }]
    });
    const http = TestBed.inject(HttpTestingController);
    const solicitud = { idEstudiante: 99, idAyudante: 8, idMateria: 25, peticion: 'Saludo de UniHub.\n\n¿Ayuda con límites & matrices?' };
    const respuesta = vi.fn();
    TestBed.inject(AyudantesService).solicitarAyuda(solicitud).subscribe(respuesta);
    const request = http.expectOne(APP_CONFIG.API.BASE_URL + APP_CONFIG.API.ENDPOINTS.SOLICITUD_AYUDA);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    expect(request.request.body).toEqual(solicitud);
    expect(request.request.body).not.toHaveProperty('estado');
    expect(respuesta).not.toHaveBeenCalled();
    request.flush({ ...solicitud, id: 501, estado: 'RESUELTA' }, { status: 201, statusText: 'Created' });
    expect(respuesta).toHaveBeenCalledOnce();
    http.verify();
  });
});
