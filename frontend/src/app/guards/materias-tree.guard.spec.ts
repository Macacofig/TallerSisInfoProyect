import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { FeatureToggleService } from '../services/feature-toggle.service';
import { materiasTreeGuard } from './materias-tree.guard';

@Component({ template: '' })
class RouteStub {}

describe('materiasTreeGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'materias', component: RouteStub },
          { path: 'home', component: RouteStub, canActivate: [materiasTreeGuard] },
        ]),
      ],
    });
  });

  it('allows navigation when the subject tree is enabled', async () => {
    TestBed.inject(FeatureToggleService).setArbolMaterias(true);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/home');

    expect(TestBed.inject(Router).url).toBe('/home');
  });

  it('redirects to materias when the subject tree is disabled', async () => {
    TestBed.inject(FeatureToggleService).setArbolMaterias(false);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/home');

    expect(TestBed.inject(Router).url).toBe('/materias');
  });
});
