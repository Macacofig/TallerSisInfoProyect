import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

@Component({ template: '' })
class RouteStub {}

describe('authGuard', () => {
  let autenticado: boolean;

  beforeEach(() => {
    autenticado = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: RouteStub },
          { path: 'perfil', component: RouteStub, canActivate: [authGuard] }
        ]),
        { provide: AuthService, useValue: { tieneSesionValida: () => autenticado } }
      ]
    });
  });

  it('redirects unauthenticated navigation to login', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/perfil');
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('allows navigation with a valid session', async () => {
    autenticado = true;
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/perfil');
    expect(TestBed.inject(Router).url).toBe('/perfil');
  });
});
