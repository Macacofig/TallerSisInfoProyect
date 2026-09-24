import { Component, DestroyRef, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { APP_CONFIG } from '../../config/app-config';
import { ErrorAuth, RegistroRequest } from '../../models/registrar';
import { AuthService } from '../../services/auth.service';
import { REGISTRO_MESSAGES } from '../../strings/registro/registro.messages';

import {
  correoValido,
  correoUcb,
  contrasenaValida,
  longitudMinimaSinEspacios,
  requeridoSinEspacios,
  telefonoValido
} from './registro.validators';

type CampoRegistro = 'nombre' | 'carrera' | 'correo' | 'telefono' | 'contrasena';
type ModoAcceso = 'registro' | 'login';

interface DescripcionCampo {
  nombre: CampoRegistro;
  tipo: 'text' | 'email' | 'password';
  etiqueta: string;
  placeholder: string;
  autocompletar: string;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro{

  // Constantes disponibles en el template
  readonly MESSAGES = REGISTRO_MESSAGES;

  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Botón del modal: se enfoca cuando el modal se abre. */
  private readonly botonModal = viewChild<ElementRef<HTMLButtonElement>>('botonModal');

  readonly modo = signal<ModoAcceso>('registro');
  readonly enviando = signal(false);
  readonly intentoEnvio = signal(false);
  readonly errorGeneral = signal<string | null>(null);
  readonly registroExitoso = signal(false);
  readonly correoRegistrado = signal('');
  readonly mostrarContrasena = signal(false);

  /** Orden = orden visual del formulario. Una fila por campo (Carrera ocupa todo el ancho). */
  readonly campos: readonly DescripcionCampo[] = [
    {
      nombre: 'nombre',
      tipo: 'text',
      etiqueta: this.MESSAGES.FIELD_NAME_LABEL,
      placeholder: this.MESSAGES.FIELD_NAME_PLACEHOLDER,
      autocompletar: 'name'
    },
    {
      nombre: 'carrera',
      tipo: 'text',
      etiqueta: this.MESSAGES.FIELD_CAREER_LABEL,
      placeholder: this.MESSAGES.FIELD_CAREER_PLACEHOLDER,
      autocompletar: 'off'
    },
    {
      nombre: 'correo',
      tipo: 'email',
      etiqueta: this.MESSAGES.FIELD_EMAIL_LABEL,
      placeholder: this.MESSAGES.FIELD_EMAIL_PLACEHOLDER,
      autocompletar: 'email'
    },
    {
      nombre: 'telefono',
      tipo: 'text',
      etiqueta: this.MESSAGES.FIELD_PHONE_LABEL,
      placeholder: this.MESSAGES.FIELD_PHONE_PLACEHOLDER,
      autocompletar: 'tel'
    },
    {
      nombre: 'contrasena',
      tipo: 'password',
      etiqueta: this.MESSAGES.FIELD_PASSWORD_LABEL,
      placeholder: this.MESSAGES.FIELD_PASSWORD_PLACEHOLDER,
      autocompletar: 'new-password'
    }
  ];

readonly formulario = this.formBuilder.group({
  nombre: [
    '',
    [
      requeridoSinEspacios,
      longitudMinimaSinEspacios(APP_CONFIG.AUTH.NOMBRE_MIN_LENGTH)
    ]
  ],

  carrera: [
    'Ingeniería de Sistemas',
    [Validators.required]
  ],

  correo: [
    '',
    [
      requeridoSinEspacios,
      correoValido,
      correoUcb
    ]
  ],

  telefono: [
    '',
    [
      requeridoSinEspacios,
      telefonoValido
    ]
  ],

  contrasena: [
    '',
    [
      requeridoSinEspacios,
      contrasenaValida
    ]
  ]
});

  constructor() {
    // Al abrirse el modal, el foco pasa a su botón (accesibilidad por teclado).
    effect(() => {
      this.botonModal()?.nativeElement.focus();
    });
  }

  cambiarModo(modo: ModoAcceso): void {
    this.modo.set(modo);
  }

  alternarContrasena(): void {
    this.mostrarContrasena.update(valor => !valor);
  }

  mensajeError(campo: CampoRegistro): string | null {
    const control = this.formulario.controls[campo];
    const errores = control.errors;

    if (!errores || !(control.touched || this.intentoEnvio())) {
      return null;
    }

    // Error devuelto por el servidor.
    const delServidor = errores['servidor'];

    if (typeof delServidor === 'string') {
      return delServidor;
    }

    const M = this.MESSAGES;

    switch (campo) {

      case 'nombre':
        if (errores['required']) {
          return M.ERROR_NAME_REQUIRED;
        }

        if (errores['minlength']) {
          return M.ERROR_NAME_MIN_LENGTH;
        }

        return 'El nombre no es válido.';


      case 'carrera':
        if (errores['required']) {
          return M.ERROR_CAREER_REQUIRED;
        }

        return 'La carrera no es válida.';


      case 'correo':
        if (errores['required']) {
          return M.ERROR_EMAIL_REQUIRED;
        }

        if (errores['correo']) {
          return M.ERROR_EMAIL_INVALID;
        }

        if (errores['correoUcb']) {
          return M.ERROR_EMAIL_UCB;
        }

        return 'El correo no es válido.';


      case 'telefono':
        if (errores['required']) {
          return 'El teléfono es obligatorio';
        }

        if (errores['telefono']) {
          return M.ERROR_PHONE_INVALID;
        }

        return 'El teléfono no es válido.';


      case 'contrasena':
        if (errores['required']) {
          return M.ERROR_PASSWORD_REQUIRED;
        }

        if (errores['passwordMinLength']) {
          return M.ERROR_PASSWORD_MIN_LENGTH;
        }

        if (errores['passwordUppercase']) {
          return M.ERROR_PASSWORD_UPPERCASE;
        }

        if (errores['passwordNumber']) {
          return M.ERROR_PASSWORD_NUMBER;
        }

        if (errores['passwordSpecial']) {
          return M.ERROR_PASSWORD_SPECIAL;
        }

        return 'La contraseña no es válida.';
    }
  }

  enviar(): void {
    if (this.enviando()) return;

    this.intentoEnvio.set(true);
    this.errorGeneral.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.enfocarPrimerCampoInvalido();
      return;
    }

    const valores = this.formulario.getRawValue();
    const datos: RegistroRequest = {
      nombre: valores.nombre.trim(),
      contrasena: valores.contrasena,
      telefono: valores.telefono.trim(),
      correoElectronico: valores.correo.trim().toLowerCase(),
      carrera: valores.carrera.trim()
    };

    this.enviando.set(true);

    // Nunca se imprime ni se guarda `datos.contrasena`.
    this.authService
      .registerUser(datos)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.correoRegistrado.set(datos.correoElectronico);
          this.registroExitoso.set(true);
        },
        error: (error: ErrorAuth) => {
          this.enviando.set(false);
          this.manejarError(error);
        }
      });
  }

  cerrarModal(): void {
    this.registroExitoso.set(false);
    this.intentoEnvio.set(false);
    this.formulario.reset();
    this.enfocarCampo('nombre');
  }

  private manejarError(error: ErrorAuth): void {
    const M = this.MESSAGES;

    switch (error?.codigo) {
      case 'CORREO_DUPLICADO':
        this.errorGeneral.set(M.ERROR_EMAIL_TAKEN);
        break;
      case 'VALIDACION':
        // Si el servidor indica qué campo falló, se muestra bajo ese campo.
        this.errorGeneral.set(
          this.aplicarErroresDelServidor(error.campos) ? null : M.ERROR_VALIDATION_SERVER
        );
        break;
      case 'SIN_CONEXION':
        this.errorGeneral.set(M.ERROR_CONNECTION);
        break;
      case 'TIEMPO_AGOTADO':
        this.errorGeneral.set(M.ERROR_TIMEOUT);
        break;
      default:
        this.errorGeneral.set(M.ERROR_SERVER);
    }
  }

  /** Marca en el formulario los errores por campo del servidor. Devuelve true si aplicó alguno. */
  private aplicarErroresDelServidor(campos?: Record<string, string>): boolean {
    if (!campos) return false;

    // El backend usa "correoElectronico"; el formulario usa "correo".
    const equivalencias: Record<string, CampoRegistro> = {
      nombre: 'nombre',
      carrera: 'carrera',
      correoElectronico: 'correo',
      correo: 'correo',
      telefono: 'telefono',
      contrasena: 'contrasena'
    };

    let aplicado = false;
    for (const [campoServidor, mensaje] of Object.entries(campos)) {
      const campo = equivalencias[campoServidor];
      if (!campo) continue;
      const control = this.formulario.controls[campo];
      control.setErrors({ servidor: mensaje });
      control.markAsTouched();
      aplicado = true;
    }
    return aplicado;
  }

  private enfocarPrimerCampoInvalido(): void {
    const primero = this.campos.find((campo) => this.formulario.controls[campo.nombre].invalid);
    if (primero) this.enfocarCampo(primero.nombre);
  }

  private enfocarCampo(campo: CampoRegistro): void {
    this.host.nativeElement.querySelector<HTMLElement>(`#registro-${campo}`)?.focus();
  }
}
