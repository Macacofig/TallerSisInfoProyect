import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Subject, of, throwError } from 'rxjs';

import { AuthService } from '../../../../../../services/auth.service';
import { AyudantesService } from '../../../../../../services/ayudantes.service';
import { LanguageService } from '../../../../../../services/language.service';
import { SolicitudAyudanteModalComponent } from './solicitud-ayudante-modal.component';

describe('SolicitudAyudanteModalComponent', () => {
  let component: SolicitudAyudanteModalComponent;
  let fixture: ComponentFixture<SolicitudAyudanteModalComponent>;

  const authServiceMock = {
    obtenerUsuario: vi.fn(() => ({
      id: 2,
      nombre: 'Ana Pérez',
      telefono: '71234567',
      correoElectronico: 'ana@ucb.edu.bo',
      carrera: 'Ingeniería de Sistemas'
    }))
  };

  const ayudantesServiceMock = {
    solicitarSerAyudante: vi.fn(() => of({}))
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    ayudantesServiceMock.solicitarSerAyudante.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [SolicitudAyudanteModalComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: AyudantesService, useValue: ayudantesServiceMock }
      ]
    }).compileComponents();

    TestBed.inject(LanguageService).setLanguage('es');
    fixture = TestBed.createComponent(SolicitudAyudanteModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('idMateria', 25);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('debe crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe iniciar sin calificación y sin horario seleccionado', () => {
    expect(component.calificacion).toBe(0);
    expect(component.diasDisponibles.every((dia) => !dia.seleccionado)).toBe(true);
  });

  it('debe iniciar sin envío en curso y sin intentos previos', () => {
    expect(component.enviando).toBe(false);
    expect(component.envioIntentado).toBe(false);
  });

  it('debe marcar la calificación requerida cuando es cero', () => {
    component.calificacion = 0;
    component.envioIntentado = true;
    fixture.detectChanges();

    const calificacion = fixture.nativeElement.querySelector(
      '#calificacion-obtenida'
    ) as HTMLInputElement;
    expect(calificacion.required).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      'La nota debe ser mayor a 0.'
    );
  });

  it('debe marcar inválida una calificación fuera del rango válido real', () => {
    component.calificacion = -1;
    component.envioIntentado = true;
    fixture.detectChanges();

    expect(component.calificacion <= 0).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      'La nota debe ser mayor a 0.'
    );
  });

  it('debe considerar válidos calificación positiva y un horario completo', () => {
    configurarFormularioValido();

    const formulario = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
    fixture.detectChanges();
    formulario.control.updateValueAndValidity();

    expect(component.calificacion).toBe(8.5);
    expect(component.horariosValidos()).toBe(true);
    expect(formulario.valid).toBe(true);
  });

  it('debe rechazar el envío con el formulario inválido', () => {
    const formulario = { valid: false } as NgForm;

    component.enviar(formulario);

    expect(ayudantesServiceMock.solicitarSerAyudante).not.toHaveBeenCalled();
    expect(component.envioIntentado).toBe(true);
  });

  it('debe enviar el payload válido y deshabilitar el envío mientras la petición está activa', () => {
    configurarFormularioValido();
    const formulario = { valid: true } as NgForm;
    const pendiente = new Subject<unknown>();
    ayudantesServiceMock.solicitarSerAyudante.mockReturnValue(pendiente);

    component.enviar(formulario);
    fixture.detectChanges();

    expect(ayudantesServiceMock.solicitarSerAyudante).toHaveBeenCalledWith({
      idEstudiante: 2,
      idMateria: 25,
      motivo: 'Necesito apoyo con funciones.',
      calificacion: 8.5,
      horarios: 'lunes 16:00-18:00'
    });
    expect(component.enviando).toBe(true);

    const boton = fixture.nativeElement.querySelector(
      '.solicitud-enviar'
    ) as HTMLButtonElement;
    expect(boton.disabled).toBe(true);

    pendiente.complete();
  });

  it('debe emitir éxito y cierre al completar la solicitud', () => {
    configurarFormularioValido();
    const formulario = { valid: true } as NgForm;
    const solicitudEnviada = vi.fn();
    const cerrarModal = vi.fn();
    component.solicitudEnviada.subscribe(solicitudEnviada);
    component.cerrarModal.subscribe(cerrarModal);

    component.enviar(formulario);

    expect(solicitudEnviada).toHaveBeenCalledOnce();
    expect(cerrarModal).toHaveBeenCalledOnce();
  });

  it('debe mostrar el error y mantener el modal abierto al fallar el servicio', () => {
    configurarFormularioValido();
    const formulario = { valid: true } as NgForm;
    const cerrarModal = vi.fn();
    component.cerrarModal.subscribe(cerrarModal);
    ayudantesServiceMock.solicitarSerAyudante.mockReturnValue(
      throwError(() => new Error('Fallo del servidor'))
    );

    component.enviar(formulario);
    fixture.detectChanges();

    expect(component.errorEnvio).not.toBe('');
    expect(component.enviando).toBe(false);
    expect(cerrarModal).not.toHaveBeenCalled();

    const alerta = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alerta).toBeTruthy();
    const boton = fixture.nativeElement.querySelector(
      '.solicitud-enviar'
    ) as HTMLButtonElement;
    expect(boton.disabled).toBe(false);
  });

  it('debe cerrar el modal con el botón X', () => {
    const cerrarModal = vi.fn();
    component.cerrarModal.subscribe(cerrarModal);

    const boton = fixture.nativeElement.querySelector(
      '.solicitud-cerrar'
    ) as HTMLButtonElement;
    boton.click();

    expect(cerrarModal).toHaveBeenCalledOnce();
  });

  it('debe cerrar el modal con Escape', () => {
    const cerrarModal = vi.fn();
    component.cerrarModal.subscribe(cerrarModal);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(cerrarModal).toHaveBeenCalledOnce();
  });

  it('debe cerrar el modal al hacer clic en el overlay', () => {
    const cerrarModal = vi.fn();
    component.cerrarModal.subscribe(cerrarModal);
    const overlay = fixture.nativeElement.querySelector(
      '.solicitud-overlay'
    ) as HTMLElement;

    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(cerrarModal).toHaveBeenCalledOnce();
  });

  function configurarFormularioValido(): void {
    component.calificacion = 8.5;
    component.motivo = '  Necesito apoyo con funciones.  ';
    component.diasDisponibles[0].seleccionado = true;
    component.diasDisponibles[0].desde = '16:00';
    component.diasDisponibles[0].hasta = '18:00';
    fixture.detectChanges();
  }
});
