import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { Login } from './login';
import { AuthService } from '../../services/auth.service';
import { ErrorAuth } from '../../models/registrar';
import { LoginRequest } from '../../models/login';
import { LOGIN_MESSAGES as M } from '../../strings/login/login.messages';

describe('Pantalla de login', () => {

  let fixture: ComponentFixture<Login>;
  let componente: Login;
  let servicio: AuthService;
  let router: Router;
  let raiz: HTMLElement;

  const validos = {
    correo: 'juan.perez@ucb.edu.bo',
    contrasena: 'Password1!'
  };

  const respuestaValida = {
    id: 1,
    nombre: 'Juan Perez',
    telefono: '71234567',
    correoElectronico: validos.correo,
    carrera: 'Ingeniería de Sistemas'
  };

  const campo = (nombre: string) =>
    raiz.querySelector<HTMLInputElement>(
      `#login-${nombre}`
    )!;

  const errorDe = (nombre: string) =>
    raiz.querySelector(
      `#login-${nombre}-error`
    )?.textContent?.trim() ?? null;

  const errorGeneral = () =>
    raiz.querySelector(
      '.login__error-general'
    )?.textContent?.trim() ?? null;

  const boton = () =>
    raiz.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    )!;

  function escribir(nombre: string, valor: string): void {
    const input = campo(nombre);

    input.value = valor;
    input.dispatchEvent(new Event('input'));
  }

  function llenar(
    datos: Partial<typeof validos> = {}
  ): void {

    const completos = {
      ...validos,
      ...datos
    };

    for (
      const [nombre, valor]
      of Object.entries(completos)
    ) {
      escribir(nombre, valor);
    }

    fixture.detectChanges();
  }

  function enviar(): void {
    boton().click();
    fixture.detectChanges();
  }

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    componente = fixture.componentInstance;
    servicio = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    raiz = fixture.nativeElement;

    fixture.detectChanges();
  });


  describe('renderizado', () => {

    it(
      'muestra los campos de correo y contraseña',
      () => {

        expect(
          campo('correo')
        ).not.toBeNull();

        expect(
          campo('contrasena')
        ).not.toBeNull();

        expect(
          campo('correo').type
        ).toBe('email');

        expect(
          campo('contrasena').type
        ).toBe('password');
      }
    );


    it(
      'muestra los textos principales del login',
      () => {

        const texto = raiz.textContent ?? '';

        for (
          const esperado of [
            M.HERO_EYEBROW,
            M.HERO_TITLE,
            M.HERO_DESCRIPTION,
            M.FEATURE_MATERIAL,
            M.FEATURE_PROFILE,
            M.FOOTER_COMMUNITY,
            M.FORM_EYEBROW,
            M.FORM_TITLE,
            M.FORM_SUBTITLE,
            M.GOOGLE_BUTTON,
            M.LOGIN_BUTTON
          ]
        ) {
          expect(texto).toContain(esperado);
        }
      }
    );


    it(
      'muestra las pestañas de Registro e Inicio de sesión',
      () => {

        const pestañas =
          Array.from(
            raiz.querySelectorAll('.login__tab')
          ).map(
            pestaña => pestaña.textContent?.trim()
          );

        expect(pestañas).toEqual([
          M.REGISTER_TAB,
          M.LOGIN_TAB
        ]);
      }
    );


    it(
      'el botón del ojo alterna entre mostrar y ocultar la contraseña',
      () => {

        const botonOjo =
          raiz.querySelector<HTMLButtonElement>(
            '.login__mostrar-contrasena'
          )!;

        expect(
          campo('contrasena').type
        ).toBe('password');

        botonOjo.click();
        fixture.detectChanges();

        expect(
          campo('contrasena').type
        ).toBe('text');

        botonOjo.click();
        fixture.detectChanges();

        expect(
          campo('contrasena').type
        ).toBe('password');
      }
    );

  });


  describe('navegación', () => {

    it(
      'al hacer clic en Registro navega a /registro',
      () => {

        const navegar =
          vi.spyOn(router, 'navigate');

        const botonRegistro =
          Array.from(
            raiz.querySelectorAll<HTMLButtonElement>(
              '.login__tab'
            )
          ).find(
            boton =>
              boton.textContent?.trim() ===
              M.REGISTER_TAB
          )!;

        botonRegistro.click();

        expect(
          navegar
        ).toHaveBeenCalledWith([
          '/registro'
        ]);
      }
    );

  });


  describe('validaciones', () => {

    it(
      'al enviar vacío muestra los errores y no llama al servicio',
      () => {

        const iniciarSesion =
          vi.spyOn(
            servicio,
            'loginUser'
          );

        enviar();

        expect(
          errorDe('correo')
        ).toBe(
          M.ERROR_EMAIL_REQUIRED
        );

        expect(
          errorDe('contrasena')
        ).toBe(
          M.ERROR_PASSWORD_REQUIRED
        );

        expect(
          iniciarSesion
        ).not.toHaveBeenCalled();
      }
    );


    it.each([
      'abc',
      'juan@',
      'juan@ucb',
      'juan@gmail.com'
    ])(
      'correo inválido: "%s"',
      (correo) => {

        llenar({
          correo
        });

        enviar();

        expect(
          errorDe('correo')
        ).toBe(
          M.ERROR_EMAIL_INVALID
        );
      }
    );


    it(
      'correo válido no muestra error',
      () => {

        llenar();

        enviar();

        expect(
          errorDe('correo')
        ).toBeNull();
      }
    );

  });


  describe('login exitoso', () => {

    it(
      'llama al servicio con el payload correcto',
      () => {

        const iniciarSesion =
          vi.spyOn(
            servicio,
            'loginUser'
          ).mockReturnValue(
            of(respuestaValida)
          );

        llenar({
          correo: ' Juan.Perez@UCB.edu.bo ',
          contrasena: 'Password1!'
        });

        enviar();

        expect(
          iniciarSesion
        ).toHaveBeenCalledOnce();

        const payload: LoginRequest =
          iniciarSesion.mock.calls[0][0];

        expect(
          payload
        ).toEqual({
          correoElectronico:
            'juan.perez@ucb.edu.bo',
          contrasena:
            'Password1!'
        });
      }
    );


    it(
      'después de iniciar sesión navega a /home',
      () => {

        vi.spyOn(
          servicio,
          'loginUser'
        ).mockReturnValue(
          of(respuestaValida)
        );

        const navegar =
          vi.spyOn(router, 'navigate');

        llenar();

        enviar();

        expect(
          navegar
        ).toHaveBeenCalledWith([
          '/home'
        ]);

        expect(
          componente.enviando()
        ).toBe(false);
      }
    );

  });


  describe('estado de carga', () => {

    it(
      'deshabilita el botón mientras espera al servidor',
      () => {

        const enProgreso =
          new Subject<typeof respuestaValida>();

        vi.spyOn(
          servicio,
          'loginUser'
        ).mockReturnValue(
          enProgreso.asObservable()
        );

        llenar();

        expect(
          boton().disabled
        ).toBe(false);

        enviar();

        expect(
          boton().disabled
        ).toBe(true);

        expect(
          componente.enviando()
        ).toBe(true);

        enProgreso.next(
          respuestaValida
        );

        enProgreso.complete();

        fixture.detectChanges();

        expect(
          componente.enviando()
        ).toBe(false);
      }
    );


    it(
      'un segundo envío mientras carga no repite la petición',
      () => {

        const iniciarSesion =
          vi.spyOn(
            servicio,
            'loginUser'
          ).mockReturnValue(
            new Subject<typeof respuestaValida>()
          );

        llenar();

        enviar();

        componente.enviar();

        expect(
          iniciarSesion
        ).toHaveBeenCalledOnce();
      }
    );

  });


  describe('errores del servidor', () => {

    it.each<[ErrorAuth, string]>([
      [
        {
          codigo: 'SIN_CONEXION',
          estado: 0
        },
        M.ERROR_CONNECTION
      ],
      [
        {
          codigo: 'TIEMPO_AGOTADO',
          estado: 0
        },
        M.ERROR_TIMEOUT
      ],
      [
        {
          codigo: 'VALIDACION',
          estado: 400
        },
        M.ERROR_VALIDATION_SERVER
      ],
      [
        {
          codigo: 'SERVIDOR',
          estado: 500
        },
        M.ERROR_INVALID_CREDENTIALS
      ]
    ])(
      '%o → muestra el mensaje correspondiente',
      (error, esperado) => {

        vi.spyOn(
          servicio,
          'loginUser'
        ).mockReturnValue(
          throwError(() => error)
        );

        llenar();

        enviar();

        expect(
          errorGeneral()
        ).toContain(
          esperado
        );

        expect(
          componente.enviando()
        ).toBe(false);

        expect(
          boton().disabled
        ).toBe(false);
      }
    );


    it(
      'un error de credenciales muestra el mensaje correspondiente',
      () => {

        const error: ErrorAuth = {
          codigo: 'SERVIDOR',
          estado: 401
        };

        vi.spyOn(
          servicio,
          'loginUser'
        ).mockReturnValue(
          throwError(() => error)
        );

        llenar();

        enviar();

        expect(
          errorGeneral()
        ).toBe(
          M.ERROR_INVALID_CREDENTIALS
        );
      }
    );

  });

});

