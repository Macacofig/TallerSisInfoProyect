import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';

import { APP_CONFIG } from '../../../../../config/app-config';
import { SolicitudAyudaRequest, SolicitudAyudaResponse } from '../../../../../models/ayudante-materia.model';
import { LoginResponse } from '../../../../../models/login';
import { AyudantesService } from '../../../../../services/ayudantes.service';
import { AuthService } from '../../../../../services/auth.service';
import { LanguageService } from '../../../../../services/language.service';
import { AyudantesComponent } from './ayudantes.component';

describe('AyudantesComponent', () => {
  let component: AyudantesComponent;
  let fixture: ComponentFixture<AyudantesComponent>;
  let dialogo: HTMLDialogElement;
  let abrirWhatsApp: ReturnType<typeof vi.spyOn>;

  const usuario: LoginResponse = {
    id: 99, nombre: 'Luis Estudiante', telefono: '70000000',
    correoElectronico: 'luis@ucb.edu.bo', carrera: 'Ingeniería de Sistemas'
  };
  let pestana: { opener: Window | null; closed: boolean; location: { replace: ReturnType<typeof vi.fn> }; close: ReturnType<typeof vi.fn> };
  const respuesta = (solicitud: SolicitudAyudaRequest): SolicitudAyudaResponse => ({
    ...solicitud, id: 501, nombreEstudiante: 'Luis Estudiante', nombreAyudante: 'Ana Torres',
    codigoMateria: 'SIS-111', nombreMateria: 'Álgebra Lineal', estado: 'RESUELTA'
  });
  const authServiceMock = {
    obtenerUsuario: vi.fn((): LoginResponse | null => usuario),
    tieneSesionValida: vi.fn(() => true)
  };
  const ayudantesServiceMock = {
    obtenerAprobadosPorMateria: vi.fn(() => of([{
      id: 8, idEstudiante: 2, nombreEstudiante: 'Ana Torres', idMateria: 25,
      codigoMateria: 'SIS-111', nombreMateria: 'Introducción a la programación',
      horario: 'Lun 16:00-18:00 · Mié 16:00-18:00', estado: 'APROBADO'
    }])),
    obtenerTelefonoEstudiante: vi.fn(() => of({ telefono: '71234567' })),
    solicitarAyuda: vi.fn((solicitud: SolicitudAyudaRequest) => of(respuesta(solicitud)))
  };
  const predeterminado =
    'Hola Ana Torres, soy Luis Estudiante. Quisiera que me des ayudantía en la materia Álgebra Lineal.';
  const personalizado = 'Necesito ayuda con límites y matrices.\n¿Podemos revisar el ejercicio 5?';

  beforeEach(async () => {
    vi.clearAllMocks();
    authServiceMock.obtenerUsuario.mockReturnValue(usuario);
    authServiceMock.tieneSesionValida.mockReturnValue(true);
    ayudantesServiceMock.solicitarAyuda.mockImplementation(solicitud => of(respuesta(solicitud)));
    ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(of({ telefono: '71234567' }));
    await TestBed.configureTestingModule({
      imports: [AyudantesComponent],
      providers: [
        { provide: AyudantesService, useValue: ayudantesServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    TestBed.inject(LanguageService).setLanguage('es');
    fixture = TestBed.createComponent(AyudantesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('idMateria', 25);
    fixture.componentRef.setInput('nombreMateria', 'Álgebra Lineal');
    fixture.detectChanges();
    await fixture.whenStable();
    prepararDialogo();
    pestana = { opener: window, closed: false, location: { replace: vi.fn() }, close: vi.fn(() => { pestana.closed = true; }) };
    abrirWhatsApp = vi.spyOn(window, 'open').mockImplementation(() => {
      pestana.closed = false;
      pestana.opener = window;
      return pestana as unknown as Window;
    });
  });

  afterEach(() => {
    if (ayudantesServiceMock.obtenerTelefonoEstudiante.mock.calls.length === 0) {
      expect(ayudantesServiceMock.solicitarAyuda).not.toHaveBeenCalled();
      expect(abrirWhatsApp).not.toHaveBeenCalled();
    }
    vi.restoreAllMocks();
  });

  function prepararDialogo(): void {
    dialogo = fixture.nativeElement.querySelector('dialog');
    // jsdom no implementa la modalidad, la contención nativa del foco ni Escape.
    dialogo.showModal = vi.fn(() => dialogo.setAttribute('open', ''));
    dialogo.close = vi.fn(() => {
      dialogo.removeAttribute('open');
      dialogo.dispatchEvent(new Event('close'));
    });
  }

  function campoMensaje(): HTMLTextAreaElement {
    return dialogo.querySelector('textarea')!;
  }

  function continuar(): HTMLButtonElement {
    return dialogo.querySelector('button[type="submit"]')!;
  }

  async function abrirContacto(): Promise<HTMLButtonElement> {
    const origen = fixture.nativeElement.querySelector('.ayudante-contacto') as HTMLButtonElement;
    origen.focus();
    origen.click();
    await fixture.whenStable();
    return origen;
  }

  async function escribirMensaje(texto: string): Promise<void> {
    campoMensaje().value = texto;
    campoMensaje().dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  }

  async function prepararContacto(texto = personalizado): Promise<HTMLButtonElement> {
    const origen = await abrirContacto();
    await escribirMensaje(texto);
    return origen;
  }

  it('should create', () => expect(component).toBeTruthy());

  it('loads the approved assistants for the selected subject', () => {
    expect(ayudantesServiceMock.obtenerAprobadosPorMateria).toHaveBeenCalledExactlyOnceWith(25);
    expect(component.ayudantes).toHaveLength(1);
  });

  it('displays the assistant name and schedule returned by the API', () => {
    expect(fixture.nativeElement.textContent).toContain('Ana Torres');
    expect(fixture.nativeElement.textContent).toContain('Lun 16:00-18:00 · Mié 16:00-18:00');
  });

  it('shows that the rating is unavailable because the endpoint does not provide it', () => {
    expect(fixture.nativeElement.textContent).toContain('Calificación no disponible');
  });

  describe('Solicitar contacto por WhatsApp', () => {
    it('abre un diálogo modal con el ayudante, materia y foco inicial correctos, sin consultar el teléfono', async () => {
      const origen = await abrirContacto();

      expect(origen.getAttribute('aria-haspopup')).toBe('dialog');
      expect(dialogo.showModal).toHaveBeenCalledOnce();
      expect(dialogo.open).toBe(true);
      expect(dialogo.querySelector('h2')?.id).toBe(dialogo.getAttribute('aria-labelledby'));
      expect(dialogo.querySelector('#contacto-descripcion')).not.toBeNull();
      expect(dialogo.textContent).toContain('Ana Torres');
      expect(dialogo.textContent).toContain('Álgebra Lineal');
      expect(component.contactoSeleccionado?.ayudante.id).toBe(8);
      expect(component.contactoSeleccionado?.idMateria).toBe(25);
      expect(dialogo.querySelector('label')?.htmlFor).toBe(campoMensaje().id);
      expect(document.activeElement).toBe(campoMensaje());
      expect(campoMensaje().hasAttribute('maxlength')).toBe(false);
      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).not.toHaveBeenCalled();
      expect(pestana.location.replace).not.toHaveBeenCalled();
    });

    it('exige sesión antes de abrir el modal', async () => {
      authServiceMock.obtenerUsuario.mockReturnValue(null);
      await abrirContacto();

      expect(dialogo.showModal).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain('Inicia sesión para solicitar ayuda.');
      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).not.toHaveBeenCalled();
      expect(pestana.location.replace).not.toHaveBeenCalled();
    });

    it('cancelar descarta el mensaje, devuelve el foco y no produce efectos externos', async () => {
      const origen = await prepararContacto();
      (dialogo.querySelector('.contacto-cancelar') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(dialogo.open).toBe(false);
      expect(component.contactoSeleccionado).toBeNull();
      expect(document.activeElement).toBe(origen);
      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).not.toHaveBeenCalled();
      expect(pestana.location.replace).not.toHaveBeenCalled();

      await abrirContacto();
      expect(campoMensaje().value).toBe('');
    });

    it('cierra con el evento cancel de Escape y devuelve el foco al origen', async () => {
      const origen = await abrirContacto();
      const escape = new Event('cancel', { cancelable: true });
      dialogo.dispatchEvent(escape);
      await fixture.whenStable();

      expect(escape.defaultPrevented).toBe(true);
      expect(dialogo.open).toBe(false);
      expect(document.activeElement).toBe(origen);
      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).not.toHaveBeenCalled();
      expect(pestana.location.replace).not.toHaveBeenCalled();
    });

    it.each(['', '  \n\t '])('rechaza un mensaje vacío o de espacios: %j', async texto => {
      await prepararContacto(texto);
      continuar().click();
      await fixture.whenStable();

      expect(campoMensaje().getAttribute('aria-invalid')).toBe('true');
      expect(campoMensaje().getAttribute('aria-describedby')).toBe('contacto-error-mensaje');
      expect(dialogo.querySelector('[role="alert"]')?.textContent)
        .toContain('Escribe un mensaje que no contenga solo espacios.');
      expect(document.activeElement).toBe(campoMensaje());
      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).not.toHaveBeenCalled();
      expect(pestana.location.replace).not.toHaveBeenCalled();
    });

    it('conserva el predeterminado y agrega el texto exacto con dos saltos, codificando acentos y caracteres especiales', async () => {
      const texto = '  ¿Límites & álgebra?\nEjercicio #5: 50% + matrices.  ';
      await prepararContacto(texto);
      continuar().click();
      await fixture.whenStable();

      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).toHaveBeenCalledExactlyOnceWith(2);
      expect(abrirWhatsApp).toHaveBeenCalledExactlyOnceWith('about:blank', '_blank');
      expect(pestana.opener).toBeNull();
      expect(pestana.location.replace).toHaveBeenCalledExactlyOnceWith(
        'https://wa.me/59171234567?text=' + encodeURIComponent(predeterminado + '\n\n' + texto)
      );
      expect(ayudantesServiceMock.solicitarAyuda).toHaveBeenCalledExactlyOnceWith({
        idEstudiante: 99, idAyudante: 8, idMateria: 25, peticion: predeterminado + '\n\n' + texto
      });
      expect(new URL(String(pestana.location.replace.mock.calls[0][0])).searchParams.get('text'))
        .toBe(ayudantesServiceMock.solicitarAyuda.mock.calls[0][0].peticion);
      expect(fixture.nativeElement.textContent).not.toContain('71234567');
    });

    it('no trunca mensajes de más de 2000 caracteres', async () => {
      const texto = 'á'.repeat(2500) + '\nFin del mensaje.';
      await prepararContacto(texto);
      continuar().click();
      await fixture.whenStable();

      const enlace = new URL(String(pestana.location.replace.mock.calls[0][0]));
      expect(enlace.searchParams.get('text')).toBe(predeterminado + '\n\n' + texto);
    });

    it.each(['59171234567', '71 234-567'])('normaliza el teléfono %s sin duplicar el prefijo', async telefono => {
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(of({ telefono }));
      await prepararContacto();
      continuar().click();
      await fixture.whenStable();

      expect(String(pestana.location.replace.mock.calls[0][0])).toContain('https://wa.me/59171234567?text=');
    });

    it.each(['', '12345'])('conserva el texto y permite reintentar con teléfono inválido: %j', async telefono => {
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(of({ telefono }));
      await prepararContacto();
      continuar().click();
      await fixture.whenStable();

      expect(pestana.location.replace).not.toHaveBeenCalled();
      expect(dialogo.querySelector('[role="alert"]')?.textContent)
        .toContain('No hay un teléfono válido disponible para WhatsApp.');
      expect(campoMensaje().value).toBe(personalizado);
      expect(continuar().disabled).toBe(false);
      expect(dialogo.open).toBe(true);
    });

    it('libera la carga y restaura el foco tras una respuesta asíncrona correcta', async () => {
      const pendiente = new Subject<{ telefono: string }>();
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(pendiente);
      const origen = await prepararContacto();
      const confirmar = continuar();
      confirmar.click();
      await fixture.whenStable();

      expect(origen.disabled).toBe(true);
      expect(confirmar.disabled).toBe(true);
      expect(confirmar.textContent).toContain('Enviando solicitud...');
      expect(campoMensaje().readOnly).toBe(true);
      const cancelar = dialogo.querySelector('.contacto-cancelar') as HTMLButtonElement;
      expect(cancelar.disabled).toBe(true);
      dialogo.dispatchEvent(new Event('cancel', { cancelable: true }));
      await fixture.whenStable();
      expect(dialogo.open).toBe(true);

      pendiente.next({ telefono: '71234567' });
      pendiente.complete();
      await fixture.whenStable();

      expect(component.solicitudEnviando).toBe(false);
      expect(origen.disabled).toBe(false);
      expect(origen.textContent).toContain('Solicitar contacto');
      expect(fixture.nativeElement.textContent).not.toContain('Enviando solicitud...');
      expect(dialogo.open).toBe(true);
      expect(dialogo.querySelector('[role="status"]')?.textContent).toContain('Solicitud registrada.');
      expect(dialogo.querySelector('button[type="submit"]')).toBeNull();
      expect(abrirWhatsApp).toHaveBeenCalledOnce();
      (dialogo.querySelector('.contacto-cancelar') as HTMLButtonElement).click();
      await fixture.whenStable();
      expect(document.activeElement).toBe(origen);
    });

    it('libera la carga, conserva el texto tras error HTTP y permite reintentar', async () => {
      const pendiente = new Subject<{ telefono: string }>();
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(pendiente);
      const origen = await prepararContacto();
      continuar().click();
      await fixture.whenStable();
      expect(origen.disabled).toBe(true);

      pendiente.error(new HttpErrorResponse({ status: 500, statusText: 'Server Error' }));
      await fixture.whenStable();

      expect(component.solicitudEnviando).toBe(false);
      expect(origen.disabled).toBe(false);
      expect(continuar().disabled).toBe(false);
      expect(campoMensaje().readOnly).toBe(false);
      expect(campoMensaje().value).toBe(personalizado);
      expect(dialogo.querySelector('[role="alert"]')?.textContent)
        .toContain('No hay un teléfono válido disponible para WhatsApp.');
      expect(pestana.location.replace).not.toHaveBeenCalled();
      expect(ayudantesServiceMock.solicitarAyuda).not.toHaveBeenCalled();
      expect(pestana.close).toHaveBeenCalledOnce();

      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(of({ telefono: '71234567' }));
      continuar().click();
      await fixture.whenStable();
      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).toHaveBeenCalledTimes(2);
      expect(new URL(String(pestana.location.replace.mock.calls[0][0])).searchParams.get('text'))
        .toBe(predeterminado + '\n\n' + personalizado);
      expect(dialogo.open).toBe(true);
      expect(dialogo.querySelector('[role="status"]')?.textContent).toContain('Solicitud registrada.');
    });

    it('libera la carga al cumplirse el timeout configurado y conserva el mensaje', async () => {
      const pendiente = new Subject<{ telefono: string }>();
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(pendiente);
      const origen = await prepararContacto();
      vi.useFakeTimers();
      try {
        continuar().click();
        await vi.advanceTimersByTimeAsync(APP_CONFIG.TIMEOUTS.API_REQUEST - 1);
        await fixture.whenStable();
        expect(origen.disabled).toBe(true);

        await vi.advanceTimersByTimeAsync(1);
        // Ejecuta también la actualización de Angular programada por el timeout.
        await vi.advanceTimersByTimeAsync(1);
        await fixture.whenStable();

        expect(component.solicitudEnviando).toBe(false);
        expect(origen.disabled).toBe(false);
        expect(continuar().disabled).toBe(false);
        expect(campoMensaje().value).toBe(personalizado);
        expect(dialogo.textContent).not.toContain('Enviando solicitud...');
        expect(dialogo.querySelector('[role="alert"]')?.textContent)
          .toContain('No hay un teléfono válido disponible para WhatsApp.');
        expect(pendiente.observed).toBe(false);
        expect(ayudantesServiceMock.solicitarAyuda).not.toHaveBeenCalled();
        expect(pestana.close).toHaveBeenCalledOnce();
        pendiente.next({ telefono: '71234567' });
        expect(pestana.location.replace).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });

    it('impide confirmaciones simultáneas incluso antes de actualizar el DOM', async () => {
      const pendiente = new Subject<{ telefono: string }>();
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(pendiente);
      const origen = await prepararContacto();
      const confirmar = continuar();
      confirmar.click();
      confirmar.click();
      component.continuarContacto();
      component.solicitarContacto(component.ayudantes[0], origen);
      await fixture.whenStable();

      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).toHaveBeenCalledExactlyOnceWith(2);
      expect(confirmar.disabled).toBe(true);
      pendiente.next({ telefono: '71234567' });
      pendiente.complete();
      await fixture.whenStable();
      expect(origen.disabled).toBe(false);
      expect(abrirWhatsApp).toHaveBeenCalledOnce();
    });

    it('cancela la consulta al destruir el componente sin abrir WhatsApp después', async () => {
      const pendiente = new Subject<{ telefono: string }>();
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(pendiente);
      await prepararContacto();
      continuar().click();
      await fixture.whenStable();
      expect(pendiente.observed).toBe(true);

      fixture.destroy();

      expect(pendiente.observed).toBe(false);
      expect(component.solicitudEnviando).toBe(false);
      pendiente.next({ telefono: '71234567' });
      pendiente.error(new HttpErrorResponse({ status: 500 }));
      expect(pestana.location.replace).not.toHaveBeenCalled();
      expect(component.mensajeSolicitud).toBe('');
    });

    it('libera la carga si la consulta termina sin respuesta', async () => {
      const pendiente = new Subject<{ telefono: string }>();
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(pendiente);
      const origen = await prepararContacto();
      continuar().click();
      await fixture.whenStable();
      expect(origen.disabled).toBe(true);

      pendiente.complete();
      await fixture.whenStable();

      expect(origen.disabled).toBe(false);
      expect(continuar().disabled).toBe(false);
      expect(campoMensaje().value).toBe(personalizado);
      expect(pestana.location.replace).not.toHaveBeenCalled();
    });

    it('vuelve a comprobar la sesión al confirmar y conserva el mensaje', async () => {
      await prepararContacto();
      authServiceMock.obtenerUsuario.mockReturnValue(null);
      continuar().click();
      await fixture.whenStable();

      expect(campoMensaje().value).toBe(personalizado);
      expect(dialogo.querySelector('[role="alert"]')?.textContent)
        .toContain('Inicia sesión para solicitar ayuda.');
      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).not.toHaveBeenCalled();
      expect(pestana.location.replace).not.toHaveBeenCalled();
    });

    it('traduce el modal al inglés conservando el texto predeterminado de WhatsApp', async () => {
      await prepararContacto();
      TestBed.inject(LanguageService).setLanguage('en');
      await fixture.whenStable();

      expect(dialogo.querySelector('h2')?.textContent).toBe('Request help');
      expect(dialogo.querySelector('label')?.textContent).toBe('What do you need help with?');
      expect(continuar().textContent).toContain('Continue to WhatsApp');
      expect(dialogo.querySelector('.contacto-cancelar')?.textContent).toContain('Cancel');
      continuar().click();
      await fixture.whenStable();
      expect(new URL(String(pestana.location.replace.mock.calls[0][0])).searchParams.get('text'))
        .toBe(predeterminado + '\n\n' + personalizado);
    });

    it('cierra y cancela una consulta pendiente si cambia la materia', async () => {
      const pendiente = new Subject<{ telefono: string }>();
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(pendiente);
      await prepararContacto();
      continuar().click();
      await fixture.whenStable();

      fixture.componentRef.setInput('idMateria', 42);
      await fixture.whenStable();

      expect(pendiente.observed).toBe(false);
      expect(component.contactoSeleccionado).toBeNull();
      expect(dialogo.open).toBe(false);
      pendiente.next({ telefono: '71234567' });
      expect(pestana.location.replace).not.toHaveBeenCalled();
    });

    it('exige sesión vigente antes de reservar pestaña o consultar', async () => {
      authServiceMock.tieneSesionValida.mockReturnValue(false);
      await abrirContacto();
      expect(dialogo.open).toBe(false);
      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).not.toHaveBeenCalled();
      expect(ayudantesServiceMock.solicitarAyuda).not.toHaveBeenCalled();
      expect(abrirWhatsApp).not.toHaveBeenCalled();
    });

    it('no consulta ni registra al confirmar sin selección', () => {
      component.continuarContacto();
      expect(abrirWhatsApp).not.toHaveBeenCalled();
      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).not.toHaveBeenCalled();
      expect(ayudantesServiceMock.solicitarAyuda).not.toHaveBeenCalled();
    });

    it('rechaza la confirmación si la sesión expiró después de abrir el modal', async () => {
      await prepararContacto();
      authServiceMock.tieneSesionValida.mockReturnValue(false);
      continuar().click();
      await fixture.whenStable();
      expect(campoMensaje().value).toBe(personalizado);
      expect(dialogo.querySelector('[role="alert"]')?.textContent).toContain('Inicia sesión');
      expect(abrirWhatsApp).not.toHaveBeenCalled();
      expect(ayudantesServiceMock.obtenerTelefonoEstudiante).not.toHaveBeenCalled();
      expect(ayudantesServiceMock.solicitarAyuda).not.toHaveBeenCalled();
    });

    it('respeta el orden teléfono válido, POST confirmado y navegación, sin enviar estado', async () => {
      const telefono = new Subject<{ telefono: string }>();
      const guardado = new Subject<SolicitudAyudaResponse>();
      const orden: string[] = [];
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockImplementation(() => {
        expect(pestana.opener).toBeNull();
        orden.push('telefono');
        return telefono;
      });
      ayudantesServiceMock.solicitarAyuda.mockImplementation(() => {
        orden.push('post');
        return guardado;
      });
      pestana.location.replace.mockImplementation(() => orden.push('navegacion'));
      const origen = await prepararContacto();
      continuar().click();
      await fixture.whenStable();
      expect(orden).toEqual(['telefono']);
      expect(ayudantesServiceMock.solicitarAyuda).not.toHaveBeenCalled();

      telefono.next({ telefono: '71234567' });
      await fixture.whenStable();
      const payload = ayudantesServiceMock.solicitarAyuda.mock.calls[0][0];
      expect(payload).toEqual({ idEstudiante: 99, idAyudante: 8, idMateria: 25, peticion: predeterminado + '\n\n' + personalizado });
      expect(payload).not.toHaveProperty('estado');
      expect(orden).toEqual(['telefono', 'post']);
      continuar().click();
      component.continuarContacto();
      expect(ayudantesServiceMock.solicitarAyuda).toHaveBeenCalledOnce();
      expect(origen.disabled).toBe(true);
      expect(pestana.location.replace).not.toHaveBeenCalled();
      expect(dialogo.querySelector('a')).toBeNull();

      orden.push('confirmacion');
      guardado.next(respuesta(payload));
      await fixture.whenStable();
      expect(orden).toEqual(['telefono', 'post', 'confirmacion', 'navegacion']);
      expect(new URL(String(pestana.location.replace.mock.calls[0][0])).searchParams.get('text')).toBe(payload.peticion);
      expect(origen.disabled).toBe(false);
      expect(pestana.close).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(dialogo.querySelector('a'));
    });

    it('un teléfono inválido cierra la reserva y nunca inicia el POST', async () => {
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(of({ telefono: '123' }));
      await prepararContacto();
      continuar().click();
      await fixture.whenStable();
      expect(ayudantesServiceMock.solicitarAyuda).not.toHaveBeenCalled();
      expect(pestana.close).toHaveBeenCalledOnce();
      expect(pestana.location.replace).not.toHaveBeenCalled();
    });

    it('un error al guardar conserva el texto, cierra la reserva y permite reintento explícito', async () => {
      const guardado = new Subject<SolicitudAyudaResponse>();
      ayudantesServiceMock.solicitarAyuda.mockReturnValue(guardado);
      const origen = await prepararContacto();
      continuar().click();
      await fixture.whenStable();
      guardado.error(new HttpErrorResponse({ status: 500 }));
      await fixture.whenStable();
      expect(campoMensaje().value).toBe(personalizado);
      expect(dialogo.querySelector('[role="alert"]')?.textContent).toContain('No se pudo registrar la solicitud.');
      expect(continuar().disabled).toBe(false);
      expect(origen.disabled).toBe(false);
      expect(pestana.close).toHaveBeenCalledOnce();
      expect(pestana.location.replace).not.toHaveBeenCalled();
      expect(ayudantesServiceMock.solicitarAyuda).toHaveBeenCalledOnce();

      ayudantesServiceMock.solicitarAyuda.mockImplementation(solicitud => of(respuesta(solicitud)));
      continuar().click();
      await fixture.whenStable();
      expect(ayudantesServiceMock.solicitarAyuda).toHaveBeenCalledTimes(2);
      expect(pestana.location.replace).toHaveBeenCalledOnce();
    });

    it('el timeout del POST libera la carga, avisa de registro incierto y no reintenta automáticamente', async () => {
      const guardado = new Subject<SolicitudAyudaResponse>();
      ayudantesServiceMock.solicitarAyuda.mockReturnValue(guardado);
      const origen = await prepararContacto();
      vi.useFakeTimers();
      try {
        continuar().click();
        await vi.advanceTimersByTimeAsync(APP_CONFIG.TIMEOUTS.API_REQUEST - 1);
        await fixture.whenStable();
        expect(origen.disabled).toBe(true);
        await vi.advanceTimersByTimeAsync(2);
        await fixture.whenStable();
        expect(origen.disabled).toBe(false);
        expect(continuar().disabled).toBe(false);
        expect(campoMensaje().value).toBe(personalizado);
        expect(dialogo.querySelector('[role="alert"]')?.textContent).toContain('La solicitud podría haberse guardado');
        expect(pestana.close).toHaveBeenCalledOnce();
        expect(guardado.observed).toBe(false);
        guardado.next(respuesta(ayudantesServiceMock.solicitarAyuda.mock.calls[0][0]));
        await vi.advanceTimersByTimeAsync(APP_CONFIG.TIMEOUTS.API_REQUEST * 2);
        expect(ayudantesServiceMock.solicitarAyuda).toHaveBeenCalledOnce();
        expect(pestana.location.replace).not.toHaveBeenCalled();
        expect(dialogo.querySelector('a')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it.each([0, 401, 403])('maneja el error de guardado HTTP %s sin navegar', async status => {
      const guardado = new Subject<SolicitudAyudaResponse>();
      ayudantesServiceMock.solicitarAyuda.mockReturnValue(guardado);
      await prepararContacto();
      continuar().click();
      guardado.error(new HttpErrorResponse({ status }));
      await fixture.whenStable();
      const mensaje = status === 0 ? 'podría haberse guardado' : status === 401 ? 'Inicia sesión' : 'No se pudo registrar';
      expect(dialogo.querySelector('[role="alert"]')?.textContent).toContain(mensaje);
      expect(campoMensaje().value).toBe(personalizado);
      expect(pestana.close).toHaveBeenCalledOnce();
      expect(pestana.location.replace).not.toHaveBeenCalled();
      expect(ayudantesServiceMock.solicitarAyuda).toHaveBeenCalledOnce();
    });

    it('destruir durante el POST cancela la suscripción y cierra la pestaña sin navegar', async () => {
      const guardado = new Subject<SolicitudAyudaResponse>();
      ayudantesServiceMock.solicitarAyuda.mockReturnValue(guardado);
      await prepararContacto();
      continuar().click();
      await fixture.whenStable();
      expect(guardado.observed).toBe(true);
      fixture.destroy();
      expect(guardado.observed).toBe(false);
      expect(pestana.close).toHaveBeenCalledOnce();
      expect(component.solicitudEnviando).toBe(false);
      guardado.next(respuesta(ayudantesServiceMock.solicitarAyuda.mock.calls[0][0]));
      expect(pestana.location.replace).not.toHaveBeenCalled();
    });

    it.each(['bloqueada', 'cerrada', 'navegacion fallida'])('ofrece apertura alternativa si la pestaña está %s, sin repetir el POST', async caso => {
      const guardado = new Subject<SolicitudAyudaResponse>();
      ayudantesServiceMock.solicitarAyuda.mockReturnValue(guardado);
      if (caso === 'bloqueada') abrirWhatsApp.mockReturnValue(null);
      if (caso === 'navegacion fallida') pestana.location.replace.mockImplementation(() => { throw new Error('Navegación denegada'); });
      await prepararContacto();
      continuar().click();
      if (caso === 'cerrada') pestana.closed = true;
      guardado.next(respuesta(ayudantesServiceMock.solicitarAyuda.mock.calls[0][0]));
      await fixture.whenStable();
      const enlace = dialogo.querySelector('a')!;
      expect(enlace.href).toBe(component.enlaceWhatsAppRegistrado);
      expect(enlace.target).toBe('_blank');
      expect(enlace.rel).toContain('noopener');
      expect(enlace.rel).toContain('noreferrer');
      expect(dialogo.querySelector('[role="status"]')?.textContent).toContain('Esto no confirma el envío');
      enlace.addEventListener('click', event => event.preventDefault());
      enlace.click();
      enlace.click();
      component.continuarContacto();
      expect(ayudantesServiceMock.solicitarAyuda).toHaveBeenCalledOnce();
      expect(abrirWhatsApp).toHaveBeenCalledOnce();
      (dialogo.querySelector('.contacto-cancelar') as HTMLButtonElement).click();
      await fixture.whenStable();
      const enlaceFuera = fixture.nativeElement.querySelector('a.contacto-abrir') as HTMLAnchorElement;
      expect(enlaceFuera.href).toBe(enlace.href);
      expect(ayudantesServiceMock.solicitarAyuda).toHaveBeenCalledOnce();
    });

    it('no muestra el botón en la tarjeta del ayudante propio', async () => {
      authServiceMock.obtenerUsuario.mockReturnValue({ ...usuario, id: 2 });
      fixture.destroy();
      fixture = TestBed.createComponent(AyudantesComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('idMateria', 25);
      fixture.componentRef.setInput('nombreMateria', 'Álgebra Lineal');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.esAyudantePropio(component.ayudantes[0])).toBe(true);
      expect(fixture.nativeElement.querySelector('.ayudante-contacto')).toBeNull();
    });
  });
});
