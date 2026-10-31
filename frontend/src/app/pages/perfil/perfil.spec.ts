import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Perfil } from './perfil';
import { AuthService } from '../../services/auth.service';
import { FeatureToggleService, FEATURE_TOGGLE_STORAGE_KEYS } from '../../services/feature-toggle.service';

describe('Perfil', () => {
  let component: Perfil;
  let fixture: ComponentFixture<Perfil>;
  let authService: AuthService;

  const usuarioMock = {
    id: 1,
    nombre: 'Nataly Ramirez Machicado',
    telefono: '69466163',
    correoElectronico: 'nataly.ramirez@ucb.edu.bo',
    carrera: 'Ingeniería de Sistemas'
  };

  beforeEach(async () => {
    localStorage.removeItem(FEATURE_TOGGLE_STORAGE_KEYS.cambioIdioma);
    localStorage.removeItem(FEATURE_TOGGLE_STORAGE_KEYS.arbolMaterias);
    await TestBed.configureTestingModule({
      imports: [Perfil],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    authService.guardarUsuario(usuarioMock);

    fixture = TestBed.createComponent(Perfil);
    component = fixture.componentInstance;
    fixture.detectChanges();

    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.removeItem('usuario');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los datos del usuario en el formulario', () => {
    expect(component.formulario.controls.nombre.value)
      .toBe('Nataly Ramirez Machicado');

    expect(component.formulario.controls.telefono.value)
      .toBe('69466163');

    expect(component.formulario.controls.carrera.value)
      .toBe('Ingeniería de Sistemas');
  });

  it('debería mostrar el correo electrónico del usuario', () => {
    expect(component.usuario?.correoElectronico)
      .toBe('nataly.ramirez@ucb.edu.bo');
  });

  it('debería cerrar el modal', () => {
    component.modalVisible.set(true);

    component.cerrarModal();

    expect(component.modalVisible()).toBe(false);
  });

  it('muestra los dos switches de funcionalidades', () => {
    const switches = fixture.nativeElement.querySelectorAll('[role="switch"]');

    expect(switches.length).toBe(2);
  });

  it('refleja el estado activo de los dos switches', () => {
    const featureToggleService = TestBed.inject(FeatureToggleService);
    featureToggleService.setCambioIdioma(true);
    featureToggleService.setArbolMaterias(true);
    fixture.detectChanges();

    const switches = fixture.nativeElement.querySelectorAll('[role="switch"]');

    expect(switches[0].getAttribute('aria-checked')).toBe('true');
    expect(switches[1].getAttribute('aria-checked')).toBe('true');
  });

  it('actualiza cambio de idioma al hacer click en su switch', () => {
    const featureToggleService = TestBed.inject(FeatureToggleService);
    featureToggleService.setCambioIdioma(true);
    fixture.detectChanges();

    const languageSwitch = fixture.nativeElement.querySelectorAll('[role="switch"]')[0] as HTMLButtonElement;
    languageSwitch.click();
    fixture.detectChanges();

    expect(featureToggleService.cambioIdioma()).toBe(false);
    expect(languageSwitch.getAttribute('aria-checked')).toBe('false');
  });

  it('actualiza árbol de materias al hacer click en su switch', () => {
    const featureToggleService = TestBed.inject(FeatureToggleService);
    featureToggleService.setArbolMaterias(true);
    fixture.detectChanges();

    const treeSwitch = fixture.nativeElement.querySelectorAll('[role="switch"]')[1] as HTMLButtonElement;
    treeSwitch.click();
    fixture.detectChanges();

    expect(featureToggleService.arbolMaterias()).toBe(false);
    expect(treeSwitch.getAttribute('aria-checked')).toBe('false');
  });
});