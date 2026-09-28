import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Perfil } from './perfil';
import { AuthService } from '../../services/auth.service';

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
});