
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { AyudantesService } from '../../../../../services/ayudantes.service';
import { AuthService } from '../../../../../services/auth.service';
import { LanguageService } from '../../../../../services/language.service';
import { AyudantesComponent } from './ayudantes.component';

describe('AyudantesComponent', () => {
  let component: AyudantesComponent;
  let fixture: ComponentFixture<AyudantesComponent>;

  const authServiceMock = {
    obtenerUsuario: vi.fn(() => ({
      id: 99,
      nombre: 'Luis Estudiante',
      telefono: '70000000',
      correoElectronico: 'luis@ucb.edu.bo',
      carrera: 'Ingeniería de Sistemas'
    }))
  };

  const ayudantesServiceMock = {
    obtenerAprobadosPorMateria: vi.fn(() => of([
      {
        id: 8,
        idEstudiante: 2,
        nombreEstudiante: 'Ana Torres',
        idMateria: 25,
        codigoMateria: 'SIS-111',
        nombreMateria: 'Introducción a la programación',
        horario: 'Lun 16:00-18:00 · Mié 16:00-18:00',
        estado: 'APROBADO'
      }
    ])),
    obtenerTelefonoEstudiante: vi.fn(() => of({ telefono: '71234567' }))
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    authServiceMock.obtenerUsuario.mockReturnValue({
      id: 99,
      nombre: 'Luis Estudiante',
      telefono: '70000000',
      correoElectronico: 'luis@ucb.edu.bo',
      carrera: 'Ingeniería de Sistemas'
    });
    ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(
      of({ telefono: '71234567' })
    );
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the approved assistants for the selected subject', () => {
    expect(ayudantesServiceMock.obtenerAprobadosPorMateria)
      .toHaveBeenCalledExactlyOnceWith(25);
    expect(component.ayudantes).toHaveLength(1);
  });

  it('displays the assistant name and schedule returned by the API', () => {
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain('Ana Torres');
    expect(compiled.textContent).toContain(
      'Lun 16:00-18:00 · Mié 16:00-18:00'
    );
  });

  it('shows that the rating is unavailable because the endpoint does not provide it', () => {
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain('Calificación no disponible');
  });

  describe('Solicitar contacto por WhatsApp', () => {
    it('debe abrir WhatsApp con el prefijo 591 y el texto solicitado', () => {
      const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(
        of({ telefono: '71234567' })
      );

      const boton = fixture.nativeElement.querySelector(
        '.ayudante-contacto'
      ) as HTMLButtonElement;
      boton.click();
      fixture.detectChanges();

      expect(ayudantesServiceMock.obtenerTelefonoEstudiante)
        .toHaveBeenCalledExactlyOnceWith(2);
      expect(abrir).toHaveBeenCalledOnce();
      const [url, destino, opciones] = abrir.mock.calls[0];
      const urlTexto = String(url ?? '');
      expect(urlTexto.startsWith('https://wa.me/59171234567?text='))
        .toBe(true);
      expect(destino).toBe('_blank');
      expect(opciones).toBe('noopener');

      const texto = decodeURIComponent(urlTexto.split('?text=')[1]);
      expect(texto).toBe(
        'Hola Ana Torres, soy Luis Estudiante. Quisiera que me des ayudantía en la materia Álgebra Lineal.'
      );
    });

    it('debe abrir WhatsApp sin duplicar un prefijo 591 ya incluido', () => {
      const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(
        of({ telefono: '59171234567' })
      );

      const boton = fixture.nativeElement.querySelector(
        '.ayudante-contacto'
      ) as HTMLButtonElement;
      boton.click();
      fixture.detectChanges();

      expect(
        String(abrir.mock.calls[0]?.[0] ?? '').startsWith(
          'https://wa.me/59171234567?text='
        )
      ).toBe(true);
    });

    it('debe normalizar espacios y guiones del teléfono', () => {
      const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(
        of({ telefono: '71 234-567' })
      );

      const boton = fixture.nativeElement.querySelector(
        '.ayudante-contacto'
      ) as HTMLButtonElement;
      boton.click();
      fixture.detectChanges();

      expect(
        String(abrir.mock.calls[0]?.[0] ?? '').startsWith(
          'https://wa.me/59171234567?text='
        )
      ).toBe(true);
    });

    it('debe mostrar el aviso y no abrir WhatsApp cuando el teléfono está vacío', () => {
      const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(
        of({ telefono: '' })
      );

      const boton = fixture.nativeElement.querySelector(
        '.ayudante-contacto'
      ) as HTMLButtonElement;
      boton.click();
      fixture.detectChanges();

      expect(abrir).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain(
        'No hay un teléfono válido disponible para WhatsApp.'
      );
    });

    it('debe mostrar el aviso y no abrir WhatsApp cuando el teléfono es inválido', () => {
      const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(
        of({ telefono: '12345' })
      );

      const boton = fixture.nativeElement.querySelector(
        '.ayudante-contacto'
      ) as HTMLButtonElement;
      boton.click();
      fixture.detectChanges();

      expect(abrir).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain(
        'No hay un teléfono válido disponible para WhatsApp.'
      );
    });

    it('debe mostrar el aviso y no abrir WhatsApp al fallar el servicio', () => {
      const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(
        throwError(() => new Error('Fallo del servidor'))
      );

      const boton = fixture.nativeElement.querySelector(
        '.ayudante-contacto'
      ) as HTMLButtonElement;
      boton.click();
      fixture.detectChanges();

      expect(abrir).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain(
        'No hay un teléfono válido disponible para WhatsApp.'
      );
    });

    it('debe deshabilitar el botón durante la petición y rehabilitarlo al terminar', async () => {
      const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
      const pendiente = new Subject<{ telefono: string }>();
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(pendiente);

      const boton = fixture.nativeElement.querySelector(
        '.ayudante-contacto'
      ) as HTMLButtonElement;
      boton.click();
      fixture.detectChanges();

      expect(component.solicitudEnviando).toBe(true);
      expect(boton.disabled).toBe(true);

      pendiente.next({ telefono: '71234567' });
      pendiente.complete();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(component.solicitudEnviando).toBe(false);
      expect(abrir).toHaveBeenCalledOnce();
    });

    it('debe rehabilitar el botón al fallar la petición', async () => {
      vi.spyOn(window, 'open').mockImplementation(() => null);
      const pendiente = new Subject<{ telefono: string }>();
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(pendiente);

      const boton = fixture.nativeElement.querySelector(
        '.ayudante-contacto'
      ) as HTMLButtonElement;
      boton.click();
      fixture.detectChanges();

      expect(boton.disabled).toBe(true);
      pendiente.error(new Error('Fallo del servidor'));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(component.solicitudEnviando).toBe(false);
    });

    it('no debe mostrar el botón en la tarjeta del ayudante propio', async () => {
      authServiceMock.obtenerUsuario.mockReturnValue({
        id: 2,
        nombre: 'Ana Torres',
        telefono: '71234567',
        correoElectronico: 'ana@ucb.edu.bo',
        carrera: 'Ingeniería de Sistemas'
      });
      fixture.destroy();
      fixture = TestBed.createComponent(AyudantesComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('idMateria', 25);
      fixture.componentRef.setInput('nombreMateria', 'Álgebra Lineal');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(component.esAyudantePropio(component.ayudantes[0])).toBe(true);

      const boton = fixture.nativeElement.querySelector(
        '.ayudante-contacto'
      );
      expect(boton).toBeNull();
    });

    it('no debe mostrar el teléfono como texto en el DOM', () => {
      const abrir = vi.spyOn(window, 'open').mockImplementation(() => null);
      ayudantesServiceMock.obtenerTelefonoEstudiante.mockReturnValue(
        of({ telefono: '71234567' })
      );

      const boton = fixture.nativeElement.querySelector(
        '.ayudante-contacto'
      ) as HTMLButtonElement;
      boton.click();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain('71234567');
      expect(abrir).toHaveBeenCalledOnce();
    });
  });
});
