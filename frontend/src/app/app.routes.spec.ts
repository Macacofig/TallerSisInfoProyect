import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { Registro } from './pages/registro/registro';
import { AuthService } from './services/auth.service';
import { APP_CONFIG } from './config/app-config';
import { MiActividadComponent } from './pages/mi-actividad/mi-actividad.component';
import { Login } from './pages/login/login';

describe('Rutas desconocidas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]
    });
  });

  it.each(['/cursos', '/ruta-inexistente'])(
    'redirige %s a una pantalla pública válida',
    async (url) => {
      const harness = await RouterTestingHarness.create(url);

      expect(TestBed.inject(Router).url).toBe('/registro');
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(Registro);
    }
  );
});

describe('Ruta de Mi actividad', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  const url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.ACTIVIDAD_ESTUDIANTE}/estudiante/41`;

  beforeEach(() => {
    localStorage.removeItem('usuario');
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    auth.cerrarSesion();
    http.verify();
  });

  function iniciarSesion(vigencia = 3600): void {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + vigencia }));
    auth.guardarUsuario({
      id: 41, nombre: 'Lucía', carrera: 'Sistemas', telefono: '71234567',
      correoElectronico: 'lucia@test.invalid', accessToken: `header.${payload}.signature`
    });
  }

  it.each(['ausente', 'vencida'])('redirige al login con sesión %s sin consultar actividad', async sesion => {
    if (sesion === 'vencida') iniciarSesion(-60);
    const harness = await RouterTestingHarness.create('/mi-actividad');
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(Login);
    http.expectNone(() => true);
  });

  it('permite consultar con sesión válida y cancela la consulta al navegar fuera', async () => {
    iniciarSesion();
    const harness = await RouterTestingHarness.create('/mi-actividad');
    expect(TestBed.inject(Router).url).toBe('/mi-actividad');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(MiActividadComponent);
    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    await harness.navigateByUrl('/login');
    expect(request.cancelled).toBe(true);
  });
});
