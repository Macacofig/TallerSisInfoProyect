import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Sidebar } from './sidebar';
import { FeatureToggleService, FEATURE_TOGGLE_STORAGE_KEYS } from '../../app/services/feature-toggle.service';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    localStorage.removeItem(FEATURE_TOGGLE_STORAGE_KEYS.arbolMaterias);
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('muestra el acceso al árbol con el flag activo', () => {
    TestBed.inject(FeatureToggleService).setArbolMaterias(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a[href="/home"]')).toBeTruthy();
  });

  it('oculta el acceso al árbol con el flag desactivado', () => {
    TestBed.inject(FeatureToggleService).setArbolMaterias(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a[href="/home"]')).toBeNull();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});