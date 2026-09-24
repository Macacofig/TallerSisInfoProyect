  import { provideHttpClient } from '@angular/common/http';
  import { provideHttpClientTesting } from '@angular/common/http/testing';
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { Subject, of, throwError } from 'rxjs';
  import { Router } from '@angular/router';

  import {
    ErrorAuth,
    RegistroRequest,
    RegistroResponse
  } from '../../models/registrar';

  import { AuthService } from '../../services/auth.service';
  import { REGISTRO_MESSAGES as M } from '../../strings/registro/registro.messages';
  import { Registro } from './registro';

  describe('Pantalla de registro', () => {

    let fixture: ComponentFixture<Registro>;
    let componente: Registro;
    let servicio: AuthService;
    let raiz: HTMLElement;

    const validos = {
      nombre: 'Ana Torres',
      carrera: 'Ingeniería de Sistemas',
      correo: 'ana.torres@ucb.edu.bo',
      telefono: '71234567',
      contrasena: 'Password1!'
    };

    const respuestaValida: RegistroResponse = {
      id: 1,
      nombre: validos.nombre,
      telefono: validos.telefono,
      correoElectronico: validos.correo,
      carrera: validos.carrera
    };

    const campo = (nombre: string) =>
      raiz.querySelector<HTMLInputElement>(
        `#registro-${nombre}`
      )!;

    const errorDe = (nombre: string) =>
      raiz.querySelector(
        `#registro-${nombre}-error`
      )?.textContent?.trim() ?? null;

    const errorGeneral = () =>
      raiz.querySelector(
        '.registro__error-general'
      )?.textContent?.trim() ?? null;

    const boton = () =>
      raiz.querySelector<HTMLButtonElement>(
        'button[type="submit"]'
      )!;

    const modal = () =>
      raiz.ownerDocument.querySelector(
        '[role="dialog"]'
      );

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
        imports: [Registro],
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

      fixture = TestBed.createComponent(Registro);
      componente = fixture.componentInstance;
      servicio = TestBed.inject(AuthService);
      raiz = fixture.nativeElement;

      fixture.detectChanges();
    });

    describe('renderizado', () => {

      it(
        'muestra Nombre completo, Carrera, Correo, Teléfono y Contraseña en ese orden',
        () => {

          const etiquetas = Array.from(
            raiz.querySelectorAll('.registro__label')
          ).map(
            label => label.textContent?.trim()
          );

          expect(etiquetas).toEqual([
            'Nombre completo',
            'Carrera',
            'Correo',
            'Teléfono',
            'Contraseña'
          ]);

          expect(
            campo('nombre').placeholder
          ).toBe('Tu nombre completo');

          expect(
            campo('carrera').placeholder
          ).toBe('Ej. Ingeniería de Sistemas');

          expect(
            campo('correo').placeholder
          ).toBe(
            'nombre.primerapellido@ucb.edu.bo'
          );

          expect(
            campo('telefono').placeholder
          ).toBe('Ej. 71234567');

          expect(
            campo('contrasena').placeholder
          ).toBe('Mínimo 8 caracteres');

          expect(
            campo('contrasena').type
          ).toBe('password');
        }
      );

      it(
        'la carrera viene precargada y de solo lectura',
        () => {

          expect(
            campo('carrera').value
          ).toBe('Ingeniería de Sistemas');

          expect(
            campo('carrera').readOnly
          ).toBe(true);
        }
      );

      it(
        'NO muestra el campo Semestre',
        () => {

          expect(
            raiz.querySelector(
              '#registro-semestre, [name="semestre"], [formcontrolname="semestre"]'
            )
          ).toBeNull();

          expect(
            Array.from(
              raiz.querySelectorAll('label')
            ).some(
              label => /semestre/i.test(
                label.textContent ?? ''
              )
            )
          ).toBe(false);

          expect(
            componente.formulario.contains(
              'semestre' as never
            )
          ).toBe(false);
        }
      );

      it(
        'muestra los textos del diseño y "Crear cuenta"',
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
              M.SUBMIT_BUTTON
            ]
          ) {
            expect(texto).toContain(esperado);
          }
        }
      );

      it(
        'el botón del ojo alterna entre mostrar y ocultar la contraseña',
        () => {

          const botonOjo =
            raiz.querySelector<HTMLButtonElement>(
              '.registro__mostrar-contrasena'
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

    describe('validaciones', () => {

      it(
        'al enviar vacío muestra un error bajo cada campo y no llama al servicio',
        () => {

          const registrar =
            vi.spyOn(servicio, 'registerUser');

          enviar();

          expect(
            errorDe('nombre')
          ).toBe(M.ERROR_NAME_REQUIRED);

          expect(
            errorDe('carrera')
          ).toBeNull();

          expect(
            errorDe('correo')
          ).toBe(M.ERROR_EMAIL_REQUIRED);

          expect(
            errorDe('telefono')
          ).toBe('El teléfono es obligatorio');

          expect(
            errorDe('contrasena')
          ).toBe(M.ERROR_PASSWORD_REQUIRED);

          expect(
            registrar
          ).not.toHaveBeenCalled();

          expect(
            campo('nombre')
              .getAttribute('aria-invalid')
          ).toBe('true');

          expect(
            raiz.ownerDocument.activeElement
          ).toBe(campo('nombre'));
        }
      );

      it(
        'trata los espacios en blanco como vacío',
        () => {

          llenar({
            nombre: '     '
          });

          enviar();

          expect(
            errorDe('nombre')
          ).toBe(M.ERROR_NAME_REQUIRED);
        }
      );

      it(
        'nombre de menos de 3 caracteres',
        () => {

          llenar({
            nombre: 'Al'
          });

          enviar();

          expect(
            errorDe('nombre')
          ).toBe(M.ERROR_NAME_MIN_LENGTH);
        }
      );

      it.each([
        'abc',
        'ana@',
        'ana@ucb',
        'ana torres@ucb.edu.bo'
      ])(
        'correo inválido: "%s"',
        (correo) => {

          llenar({ correo });

          enviar();

          expect(
            errorDe('correo')
          ).toBe(M.ERROR_EMAIL_INVALID);
        }
      );

      it(
        'correo válido pero fuera del dominio UCB',
        () => {

          llenar({
            correo: 'ana@gmail.com'
          });

          enviar();

          expect(
            errorDe('correo')
          ).toBe(M.ERROR_EMAIL_UCB);
        }
      );

      it.each([
        '12345678',
        '7123456',
        '712345678',
        '7abcdefg'
      ])(
        'teléfono inválido: "%s"',
        (telefono) => {

          llenar({ telefono });

          enviar();

          expect(
            errorDe('telefono')
          ).not.toBeNull();

          expect(
            errorDe('telefono')
          ).not.toBe(
            'El teléfono es obligatorio'
          );
        }
      );

      it.each([
        '71234567',
        '60000000'
      ])(
        'teléfono válido: "%s"',
        (telefono) => {

          llenar({ telefono });

          enviar();

          expect(
            errorDe('telefono')
          ).toBeNull();
        }
      );

      it(
        'valida los requisitos de la contraseña',
        () => {

          llenar({
            contrasena: 'abc'
          });

          enviar();

          expect(
            errorDe('contrasena')
          ).toBe(
            M.ERROR_PASSWORD_MIN_LENGTH
          );

          escribir(
            'contrasena',
            'abcdefgh'
          );

          fixture.detectChanges();

          expect(
            errorDe('contrasena')
          ).toBe(
            M.ERROR_PASSWORD_UPPERCASE
          );

          escribir(
            'contrasena',
            'Abcdefgh'
          );

          fixture.detectChanges();

          expect(
            errorDe('contrasena')
          ).toBe(
            M.ERROR_PASSWORD_NUMBER
          );

          escribir(
            'contrasena',
            'Abcdefg1'
          );

          fixture.detectChanges();

          expect(
            errorDe('contrasena')
          ).toBe(
            M.ERROR_PASSWORD_SPECIAL
          );

          escribir(
            'contrasena',
            'Abcdefg1!'
          );

          fixture.detectChanges();

          expect(
            errorDe('contrasena')
          ).toBeNull();
        }
      );

      it(
        'muestra el error al salir de un campo inválido',
        () => {

          escribir(
            'correo',
            'abc'
          );

          campo('correo').dispatchEvent(
            new Event('blur')
          );

          fixture.detectChanges();

          expect(
            errorDe('correo')
          ).toBe(M.ERROR_EMAIL_INVALID);

          expect(
            errorDe('nombre')
          ).toBeNull();
        }
      );

    });

    describe('registro exitoso', () => {

      it(
        'llama al servicio con el payload correcto y muestra el modal de confirmación',
        () => {

          const registrar =
            vi.spyOn(
              servicio,
              'registerUser'
            ).mockReturnValue(
              of(respuestaValida)
            );

          llenar({
            nombre: '  Ana Torres ',
            correo: ' Ana.Torres@UCB.edu.bo '
          });

          enviar();

          expect(
            registrar
          ).toHaveBeenCalledOnce();

          const payload: RegistroRequest =
            registrar.mock.calls[0][0];

          expect(payload).toEqual({
            nombre: 'Ana Torres',
            carrera: 'Ingeniería de Sistemas',
            correoElectronico:
              'ana.torres@ucb.edu.bo',
            contrasena: 'Password1!',
            telefono: '71234567'
          });

          expect(
            payload
          ).not.toHaveProperty('semestre');

          expect(
            payload.telefono
          ).not.toBeNull();

          expect(
            modal()
          ).not.toBeNull();

          expect(
            modal()!.textContent
          ).toContain(M.MODAL_TITLE);

          expect(
            modal()!.textContent
          ).toContain(
            'ana.torres@ucb.edu.bo'
          );

          expect(
            errorGeneral()
          ).toBeNull();
        }
      );

      it(
        'el modal recibe el foco y al cerrarlo se limpia el formulario',
        () => {

          vi.spyOn(
            servicio,
            'registerUser'
          ).mockReturnValue(
            of(respuestaValida)
          );

          llenar();
          enviar();

          const entendido =
            modal()!.querySelector<HTMLButtonElement>(
              'button'
            )!;

          expect(
            raiz.ownerDocument.activeElement
          ).toBe(entendido);

          entendido.click();
          fixture.detectChanges();

          expect(
            modal()
          ).toBeNull();

          expect(
            campo('nombre').value
          ).toBe('');

          expect(
            errorDe('nombre')
          ).toBeNull();

          llenar({
            correo: 'otra.persona@ucb.edu.bo'
          });

          enviar();

          raiz.querySelector(
            '.registro-modal'
          )!.dispatchEvent(
            new KeyboardEvent(
              'keydown',
              { key: 'Escape' }
            )
          );

          fixture.detectChanges();

          expect(
            modal()
          ).toBeNull();
        }
      );

    });

    describe('estado de carga', () => {

      it(
        'deshabilita el botón mientras espera al servidor',
        () => {

          const enProgreso =
            new Subject<RegistroResponse>();

          vi.spyOn(
            servicio,
            'registerUser'
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
            boton().textContent
          ).toContain(
            'Creando cuenta...'
          );

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

          const registrar =
            vi.spyOn(
              servicio,
              'registerUser'
            ).mockReturnValue(
              new Subject<RegistroResponse>()
            );

          llenar();
          enviar();

          componente.enviar();

          expect(
            registrar
          ).toHaveBeenCalledOnce();
        }
      );

    });

    describe('errores del servidor', () => {

      it(
        '409: muestra "Este correo ya está registrado"',
        () => {

          const error: ErrorAuth = {
            codigo: 'CORREO_DUPLICADO',
            estado: 409
          };

          vi.spyOn(
            servicio,
            'registerUser'
          ).mockReturnValue(
            throwError(() => error)
          );

          llenar();
          enviar();

          expect(
            errorGeneral()
          ).toBe(
            'Este correo ya está registrado.'
          );

          expect(
            raiz
              .querySelector('form')!
              .contains(
                raiz.querySelector(
                  '.registro__error-general'
                )
              )
          ).toBe(true);

          expect(
            modal()
          ).toBeNull();

          expect(
            boton().disabled
          ).toBe(false);

          expect(
            campo('correo').value
          ).toBe(validos.correo);
        }
      );

      it(
        'el mensaje general se limpia al reintentar',
        () => {

          const espia =
            vi.spyOn(
              servicio,
              'registerUser'
            ).mockReturnValue(
              throwError(
                () =>
                  ({
                    codigo: 'CORREO_DUPLICADO',
                    estado: 409
                  }) satisfies ErrorAuth
              )
            );

          llenar();
          enviar();

          expect(
            errorGeneral()
          ).not.toBeNull();

          const enProgreso =
            new Subject<RegistroResponse>();

          espia.mockReturnValue(
            enProgreso.asObservable()
          );

          escribir(
            'correo',
            'otro@ucb.edu.bo'
          );

          enviar();

          expect(
            errorGeneral()
          ).toBeNull();

          enProgreso.next(
            respuestaValida
          );

          enProgreso.complete();
        }
      );

      it.each<[ErrorAuth, string]>([
        [
          {
            codigo: 'SIN_CONEXION',
            estado: 0
          },
          'No se pudo conectar con el servidor'
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
            codigo: 'SERVIDOR',
            estado: 500
          },
          M.ERROR_SERVER
        ],
        [
          {
            codigo: 'VALIDACION',
            estado: 400
          },
          M.ERROR_VALIDATION_SERVER
        ]
      ])(
        '%o → mensaje general',
        (error, esperado) => {

          vi.spyOn(
            servicio,
            'registerUser'
          ).mockReturnValue(
            throwError(() => error)
          );

          llenar();
          enviar();

          expect(
            errorGeneral()
          ).toContain(esperado);

          expect(
            modal()
          ).toBeNull();

          expect(
            boton().disabled
          ).toBe(false);
        }
      );

      it(
        '400 con errores por campo',
        () => {

          const error: ErrorAuth = {
            codigo: 'VALIDACION',
            estado: 400,
            campos: {
              telefono:
                'Ese teléfono ya está en uso.'
            }
          };

          vi.spyOn(
            servicio,
            'registerUser'
          ).mockReturnValue(
            throwError(() => error)
          );

          llenar();
          enviar();

          expect(
            errorDe('telefono')
          ).toBe(
            'Ese teléfono ya está en uso.'
          );

          expect(
            errorGeneral()
          ).toBeNull();

          escribir(
            'telefono',
            '71234567'
          );

          fixture.detectChanges();

          expect(
            errorDe('telefono')
          ).toBeNull();
        }
      );

    });

  });