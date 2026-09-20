import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ErrorAuth, RegistroRequest } from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';
import { REGISTRO_MESSAGES as M } from '../../strings/registro/registro.messages';
import { Registro } from './registro';

// Estas pruebas usan el MOCK de AuthService (no dependen del backend real).
describe('Pantalla de registro', () => {
  let fixture: ComponentFixture<Registro>;
  let componente: Registro;
  let servicio: AuthService;
  let raiz: HTMLElement;

  const validos = {
    nombre: 'Ana Torres',
    carrera: 'Ingeniería de Sistemas',
    correo: 'ana.torres@ucb.edu.bo',
    contrasena: 'secreta1'
  };

  const campo = (nombre: string) => raiz.querySelector<HTMLInputElement>(`#registro-${nombre}`)!;
  const errorDe = (nombre: string) => raiz.querySelector(`#registro-${nombre}-error`)?.textContent?.trim() ?? null;
  const errorGeneral = () => raiz.querySelector('.registro__error-general')?.textContent?.trim() ?? null;
  const boton = () => raiz.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const modal = () => raiz.ownerDocument.querySelector('[role="dialog"]');

  function escribir(nombre: string, valor: string): void {
    const input = campo(nombre);
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  }

  function llenar(datos: Partial<typeof validos> = {}): void {
    const completos = { ...validos, ...datos };
    for (const [nombre, valor] of Object.entries(completos)) escribir(nombre, valor);
    fixture.detectChanges();
  }

  function enviar(): void {
    boton().click();
    fixture.detectChanges();
  }

  async function esperarServidor(ms = 1000): Promise<void> {
    await vi.advanceTimersByTimeAsync(ms);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Registro] }).compileComponents();
    vi.useFakeTimers();
    fixture = TestBed.createComponent(Registro);
    componente = fixture.componentInstance;
    servicio = TestBed.inject(AuthService);
    raiz = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  describe('renderizado', () => {
    it('muestra Nombre completo, Carrera, Correo y Contraseña en ese orden', () => {
      const etiquetas = Array.from(raiz.querySelectorAll('.registro__label')).map((l) => l.textContent?.trim());
      expect(etiquetas).toEqual(['Nombre completo', 'Carrera', 'Correo', 'Contraseña']);

      expect(campo('nombre').placeholder).toBe('Tu nombre completo');
      expect(campo('carrera').placeholder).toBe('Ej. Ingeniería de Sistemas');
      expect(campo('correo').placeholder).toBe('nombre.primerapellido@ucb.edu.bo');
      expect(campo('contrasena').placeholder).toBe('Mínimo 6 caracteres');
      expect(campo('contrasena').type).toBe('password');
    });

    it('NO muestra el campo Semestre (ni en el formulario ni en el estado)', () => {
      expect(raiz.querySelector('#registro-semestre, [name="semestre"], [formcontrolname="semestre"]')).toBeNull();
      expect(Array.from(raiz.querySelectorAll('label')).some((l) => /semestre/i.test(l.textContent ?? ''))).toBe(false);
      expect(componente.formulario.contains('semestre' as never)).toBe(false);
    });

    it('NO muestra el botón "Continuar con Google" ni el separador "o usa tu correo universitario"', () => {
      expect(raiz.textContent).not.toContain('Google');
      expect(raiz.textContent).not.toContain('o usa tu correo universitario');
    });

    it('muestra los textos del diseño y "Crear cuenta" activa por defecto', () => {
      const texto = raiz.textContent ?? '';
      for (const esperado of [
        M.HERO_EYEBROW, M.HERO_TITLE, M.HERO_DESCRIPTION, M.FEATURE_MATERIAL, M.FEATURE_PROFILE,
        M.FOOTER_COMMUNITY, M.FORM_EYEBROW, M.FORM_TITLE, M.FORM_SUBTITLE, M.SUBMIT_BUTTON, M.CONFIRMATION_NOTE
      ]) {
        expect(texto).toContain(esperado);
      }

      const [login, registro] = Array.from(raiz.querySelectorAll('.registro__tab'));
      expect(login.getAttribute('aria-pressed')).toBe('false');
      expect(registro.getAttribute('aria-pressed')).toBe('true');
      expect(registro.classList).toContain('registro__tab--activa');
    });

    it('la pestaña "Iniciar sesión" muestra un aviso y "Crear cuenta" devuelve el formulario', () => {
      const [login, registro] = Array.from(raiz.querySelectorAll<HTMLButtonElement>('.registro__tab'));

      login.click();
      fixture.detectChanges();
      expect(raiz.querySelector('form')).toBeNull();
      expect(raiz.textContent).toContain(M.LOGIN_PENDING_TITLE);

      registro.click();
      fixture.detectChanges();
      expect(raiz.querySelector('form')).not.toBeNull();
    });
  });

  describe('validaciones', () => {
    it('al enviar vacío muestra un error bajo cada campo y no llama al servicio', () => {
      const registrar = vi.spyOn(servicio, 'registerUser');
      enviar();

      expect(errorDe('nombre')).toBe(M.ERROR_NAME_REQUIRED);
      expect(errorDe('carrera')).toBe(M.ERROR_CAREER_REQUIRED);
      expect(errorDe('correo')).toBe(M.ERROR_EMAIL_REQUIRED);
      expect(errorDe('contrasena')).toBe(M.ERROR_PASSWORD_REQUIRED);
      expect(registrar).not.toHaveBeenCalled();
      expect(campo('nombre').getAttribute('aria-invalid')).toBe('true');
      expect(raiz.ownerDocument.activeElement).toBe(campo('nombre'));
    });

    it('trata los espacios en blanco como vacío', () => {
      llenar({ nombre: '     ', carrera: '   ' });
      enviar();
      expect(errorDe('nombre')).toBe(M.ERROR_NAME_REQUIRED);
      expect(errorDe('carrera')).toBe(M.ERROR_CAREER_REQUIRED);
    });

    it('nombre de menos de 3 caracteres', () => {
      llenar({ nombre: 'Al' });
      enviar();
      expect(errorDe('nombre')).toBe(M.ERROR_NAME_MIN_LENGTH);
    });

    it.each(['abc', 'ana@', 'ana@ucb', 'ana torres@ucb.edu.bo'])('correo inválido: "%s"', (correo) => {
      llenar({ correo });
      enviar();
      expect(errorDe('correo')).toBe(M.ERROR_EMAIL_INVALID);
    });

    it('contraseña de menos de 6 caracteres; con 6 es válida', () => {
      llenar({ contrasena: '12345' });
      enviar();
      expect(errorDe('contrasena')).toBe(M.ERROR_PASSWORD_MIN_LENGTH);

      escribir('contrasena', '123456');
      fixture.detectChanges();
      expect(errorDe('contrasena')).toBeNull();
    });

    it('muestra el error al salir de un campo inválido, sin esperar al envío', () => {
      escribir('correo', 'abc');
      campo('correo').dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      expect(errorDe('correo')).toBe(M.ERROR_EMAIL_INVALID);
      expect(errorDe('nombre')).toBeNull();
    });
  });

  describe('registro exitoso', () => {
    it('llama al servicio con el payload correcto (sin semestre) y muestra el modal de confirmación', async () => {
      const registrar = vi.spyOn(servicio, 'registerUser');
      llenar({ nombre: '  Ana Torres ', correo: ' Ana.Torres@UCB.edu.bo ' });
      enviar();
      await esperarServidor();

      expect(registrar).toHaveBeenCalledOnce();
      const payload: RegistroRequest = registrar.mock.calls[0][0];
      expect(payload).toEqual({
        nombre: 'Ana Torres',
        carrera: 'Ingeniería de Sistemas',
        correoElectronico: 'ana.torres@ucb.edu.bo',
        contrasena: 'secreta1',
        telefono: null
      });
      expect(payload).not.toHaveProperty('semestre');

      expect(modal()).not.toBeNull();
      expect(modal()!.textContent).toContain(M.MODAL_TITLE);
      expect(modal()!.textContent).toContain('ana.torres@ucb.edu.bo');
      expect(errorGeneral()).toBeNull();
    });

    it('el modal recibe el foco y al cerrarlo (botón o Escape) se limpia el formulario', async () => {
      llenar();
      enviar();
      await esperarServidor();

      const entendido = modal()!.querySelector<HTMLButtonElement>('button')!;
      expect(raiz.ownerDocument.activeElement).toBe(entendido);

      entendido.click();
      fixture.detectChanges();
      expect(modal()).toBeNull();
      expect(campo('nombre').value).toBe('');
      expect(errorDe('nombre')).toBeNull();

      // Segunda vez, ahora con Escape
      llenar({ correo: 'otra.persona@ucb.edu.bo' });
      enviar();
      await esperarServidor();
      raiz.querySelector('.registro-modal')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(modal()).toBeNull();
    });
  });

  describe('estado de carga', () => {
    it('deshabilita el botón y muestra "Creando cuenta..." mientras se procesa', async () => {
      llenar();
      expect(boton().disabled).toBe(false);
      enviar();

      expect(boton().disabled).toBe(true);
      expect(boton().textContent).toContain('Creando cuenta...');

      await esperarServidor();
      expect(componente.enviando()).toBe(false);
    });

    it('un segundo envío mientras carga no repite la petición', () => {
      const registrar = vi.spyOn(servicio, 'registerUser');
      llenar();
      enviar();
      componente.enviar(); // p. ej. Enter repetido con el botón ya deshabilitado
      expect(registrar).toHaveBeenCalledOnce();
    });
  });

  describe('errores del servidor', () => {
    it('409: muestra "Este correo ya está registrado" encima del botón, sin modal', async () => {
      llenar({ correo: 'test@ucb.edu.bo' });
      enviar();
      await esperarServidor();

      expect(errorGeneral()).toBe('Este correo ya está registrado.');
      expect(raiz.querySelector('form')!.contains(raiz.querySelector('.registro__error-general'))).toBe(true);
      expect(modal()).toBeNull();
      expect(boton().disabled).toBe(false);
      expect(campo('correo').value).toBe('test@ucb.edu.bo'); // no se pierde lo escrito
    });

    it('el mensaje general se limpia al reintentar', async () => {
      llenar({ correo: 'test@ucb.edu.bo' });
      enviar();
      await esperarServidor();
      expect(errorGeneral()).not.toBeNull();

      escribir('correo', 'otro@ucb.edu.bo');
      enviar();
      expect(errorGeneral()).toBeNull();
      await esperarServidor();
    });

    it.each<[ErrorAuth, string]>([
      [{ codigo: 'SIN_CONEXION', estado: 0 }, 'No se pudo conectar con el servidor'],
      [{ codigo: 'TIEMPO_AGOTADO', estado: 0 }, M.ERROR_TIMEOUT],
      [{ codigo: 'SERVIDOR', estado: 500 }, M.ERROR_SERVER],
      [{ codigo: 'VALIDACION', estado: 400 }, M.ERROR_VALIDATION_SERVER]
    ])('%o → mensaje general', (error, esperado) => {
      vi.spyOn(servicio, 'registerUser').mockReturnValue(throwError(() => error));
      llenar();
      enviar();

      expect(errorGeneral()).toContain(esperado);
      expect(modal()).toBeNull();
      expect(boton().disabled).toBe(false);
    });

    it('400 con errores por campo: se muestran bajo el campo correspondiente', () => {
      const error: ErrorAuth = {
        codigo: 'VALIDACION',
        estado: 400,
        campos: { correoElectronico: 'Ese dominio no está permitido.' }
      };
      vi.spyOn(servicio, 'registerUser').mockReturnValue(throwError(() => error));
      llenar();
      enviar();

      expect(errorDe('correo')).toBe('Ese dominio no está permitido.');
      expect(errorGeneral()).toBeNull();

      // Al corregir el campo, el error del servidor desaparece.
      escribir('correo', 'ana.torres@ucb.edu.bo');
      fixture.detectChanges();
      expect(errorDe('correo')).toBeNull();
    });
  });

  it('con éxito inmediato del servicio (sin espera) también muestra el modal', () => {
    vi.spyOn(servicio, 'registerUser').mockReturnValue(of({ id: 1, nombre: 'Ana', correoElectronico: validos.correo }));
    llenar();
    enviar();
    expect(modal()).not.toBeNull();
  });
});
