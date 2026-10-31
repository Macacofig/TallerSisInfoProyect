import { TestBed } from '@angular/core/testing';

import {
  FEATURE_TOGGLE_STORAGE_KEYS,
  FeatureToggleService,
} from './feature-toggle.service';

describe('FeatureToggleService', () => {
  beforeEach(() => {
    localStorage.removeItem(FEATURE_TOGGLE_STORAGE_KEYS.cambioIdioma);
    localStorage.removeItem(FEATURE_TOGGLE_STORAGE_KEYS.arbolMaterias);
  });

  it('uses enabled defaults and toggles both flags', () => {
    const service = TestBed.runInInjectionContext(() => new FeatureToggleService());

    expect(service.cambioIdioma()).toBe(true);
    expect(service.arbolMaterias()).toBe(true);

    service.toggleCambioIdioma();
    service.toggleArbolMaterias();

    expect(service.cambioIdioma()).toBe(false);
    expect(service.arbolMaterias()).toBe(false);
  });

  it('persists flag changes in localStorage', () => {
    const service = TestBed.runInInjectionContext(() => new FeatureToggleService());

    service.setCambioIdioma(false);
    service.setArbolMaterias(false);

    expect(localStorage.getItem(FEATURE_TOGGLE_STORAGE_KEYS.cambioIdioma)).toBe('false');
    expect(localStorage.getItem(FEATURE_TOGGLE_STORAGE_KEYS.arbolMaterias)).toBe('false');
  });

  it('falls back to enabled when a stored value is invalid', () => {
    localStorage.setItem(FEATURE_TOGGLE_STORAGE_KEYS.cambioIdioma, 'invalid');
    localStorage.setItem(FEATURE_TOGGLE_STORAGE_KEYS.arbolMaterias, 'invalid');

    const service = TestBed.runInInjectionContext(() => new FeatureToggleService());

    expect(service.cambioIdioma()).toBe(true);
    expect(service.arbolMaterias()).toBe(true);
  });
});
