import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../config/app-config';
import { AuthService } from './auth.service';
import { SolicitudMaterialAdminService } from './solicitud-material-admin.service';

describe('SolicitudMaterialAdminService', () => {
  let http: HttpTestingController;
  let service: SolicitudMaterialAdminService;
  const url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.SOLICITUD_MATERIAL}`;
  const respuesta = {
    id: 21,
    titulo: 'Documento de prueba',
    idEstudiante: 6,
    nombreEstudiante: 'Hugo Paz',
    idMaterial: 34,
    linkMaterial: 'https://storage.example/file.pdf',
    estado: 'PENDIENTE'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            obtenerHeadersAutenticacion: () => new HttpHeaders({ Authorization: 'Bearer test-token' })
          }
        }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(SolicitudMaterialAdminService);
  });

  afterEach(() => http.verify());

  it('lista pendientes con JWT', () => {
    service.obtenerPendientes().subscribe();
    const request = http.expectOne(`${url}/pendientes`);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush([]);
  });

  it('aprueba y rechaza con POST y JWT', () => {
    service.aprobar(21).subscribe();
    service.rechazar(22).subscribe();

    const approve = http.expectOne(`${url}/21/aprobar`);
    expect(approve.request.method).toBe('POST');
    expect(approve.request.headers.get('Authorization')).toBe('Bearer test-token');
    approve.flush(respuesta);

    const reject = http.expectOne(`${url}/22/rechazar`);
    expect(reject.request.method).toBe('POST');
    expect(reject.request.headers.get('Authorization')).toBe('Bearer test-token');
    reject.flush(respuesta);
  });

  it('elimina con DELETE y JWT', () => {
    service.eliminar(23).subscribe();
    const request = http.expectOne(`${url}/23`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush(null);
  });
});
