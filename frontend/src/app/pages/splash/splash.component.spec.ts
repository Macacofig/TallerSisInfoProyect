import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';
import { Registro } from '../registro/registro';
import { SplashComponent } from './splash.component';

describe('Navegación: Splash → Registro', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('tras 3 segundos navega a /registro reemplazando el splash en el historial', async () => {
    const navigate = vi.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      imports: [SplashComponent],
      providers: [{ provide: Router, useValue: { navigate } }]
    });
    TestBed.createComponent(SplashComponent).detectChanges();

    await vi.advanceTimersByTimeAsync(2999);
    expect(navigate).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    // replaceUrl: true → con "atrás" no se vuelve al splash.
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/registro'], { replaceUrl: true });
  });

  it('con el router real: el splash termina y se muestra la pantalla de Registro', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]
    });

    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(SplashComponent);

    await vi.advanceTimersByTimeAsync(3000);
    harness.detectChanges();

    expect(TestBed.inject(Router).url).toBe('/registro');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(Registro);
  });
});
