import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Sidebar } from './sidebar';
import { FeatureToggleService, FEATURE_TOGGLE_STORAGE_KEYS } from '../../app/services/feature-toggle.service';
import { AuthService } from '../../app/services/auth.service';
import { LanguageService } from '../../app/services/language.service';

@Component({ template: '' })
class PaginaPrueba {}

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    localStorage.removeItem(FEATURE_TOGGLE_STORAGE_KEYS.arbolMaterias);
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([
          { path: 'mi-actividad', component: PaginaPrueba },
          { path: 'materias', component: PaginaPrueba }
        ]),
        { provide: AuthService, useValue: { tieneRolAdministrador: () => false } }
      ]
    }).compileComponents();

    TestBed.inject(LanguageService).setLanguage('es');
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

  it('navega a Mi actividad desde el menú compartido de escritorio y móvil', async () => {
    const enlace = fixture.nativeElement.querySelector('a[href="/mi-actividad"]') as HTMLAnchorElement;
    expect(enlace.textContent).toContain('Mi actividad');
    expect(enlace.closest('nav')?.getAttribute('aria-label')).toBe('Navegación principal');
    enlace.click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/mi-actividad');
    expect(enlace.getAttribute('aria-current')).toBe('page');
    expect(enlace.classList.contains('sidebar__item--active')).toBe(true);
  });

  it('oculta el aviso demo solo en Mi actividad, incluso con query y fragmento', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/materias');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.sidebar__footer')?.textContent).toContain('Datos de demostración');

    await router.navigateByUrl('/mi-actividad?origen=menu#bitacora');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.sidebar__footer')).toBeNull();

    await router.navigateByUrl('/materias');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.sidebar__footer')?.textContent).toContain('Datos de demostración');
  });

  it('traduce el enlace y conserva su destino', async () => {
    TestBed.inject(LanguageService).setLanguage('en');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('a[href="/mi-actividad"]')?.textContent).toContain('My activity');
    expect(fixture.nativeElement.querySelector('nav')?.getAttribute('aria-label')).toBe('Main navigation');
  });
});
