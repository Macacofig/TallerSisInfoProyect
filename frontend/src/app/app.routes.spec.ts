import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { Registro } from './pages/registro/registro';

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
