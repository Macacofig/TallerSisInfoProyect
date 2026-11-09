import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { FeatureToggleService } from '../../services/feature-toggle.service';
import { ErrorAuth } from '../../models/registrar';
import { contrasenaValida } from '../registro/registro.validators';
import { LOGIN_MESSAGES } from '../../strings/login/login.messages';
import { LOGIN_MESSAGES_EN } from '../../strings/login/login-ingles.messages';
import { RECUPERAR_MESSAGES } from '../../strings/recuperar-contrasena/recuperar-contrasena.messages';
import { RECUPERAR_MESSAGES_EN } from '../../strings/recuperar-contrasena/recuperar-contrasena-ingles.messages';

type Campo = 'correoElectronico' | 'nuevaContrasena' | 'confirmarNuevaContrasena';
type Mensaje = keyof typeof RECUPERAR_MESSAGES;

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.html',
  styleUrls: ['../login/login.css', './recuperar-contrasena.css'],
})
export class RecuperarContrasena {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly languageService = inject(LanguageService);
  readonly featureToggleService = inject(FeatureToggleService);
  readonly enviando = signal(false);
  readonly exito = signal(false);
  readonly errorGeneral = signal<Mensaje | null>(null);
  readonly mostrarContrasena = signal(false);
  readonly mostrarConfirmacion = signal(false);
  readonly campos = ['nuevaContrasena', 'confirmarNuevaContrasena'] as const;

  get MESSAGES() {
    return this.languageService.getMessages(RECUPERAR_MESSAGES, RECUPERAR_MESSAGES_EN);
  }
  get BRAND() {
    return this.languageService.getMessages(LOGIN_MESSAGES, LOGIN_MESSAGES_EN);
  }

  readonly formulario = this.fb.group({
    correoElectronico: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@ucb\.edu\.bo$/)]],
    nuevaContrasena: ['', [Validators.required, contrasenaValida]],
    confirmarNuevaContrasena: ['', Validators.required],
  }, {
    validators: grupo => grupo.get('nuevaContrasena')?.value === grupo.get('confirmarNuevaContrasena')?.value
      ? null : { noCoinciden: true },
  });

  mensajeError(campo: Campo): string | null {
    const control = this.formulario.controls[campo];
    if (!control.touched) return null;
    if (control.hasError('required')) {
      return this.MESSAGES[campo === 'correoElectronico' ? 'REQUIRED_EMAIL'
        : campo === 'nuevaContrasena' ? 'REQUIRED_PASSWORD' : 'REQUIRED_CONFIRM'];
    }
    if (campo === 'correoElectronico' && control.invalid) return this.MESSAGES.INVALID_EMAIL;
    const errores = {
      passwordMinLength: 'MIN_LENGTH', passwordUppercase: 'UPPERCASE',
      passwordNumber: 'NUMBER', passwordSpecial: 'SPECIAL',
    } as const;
    for (const [error, mensaje] of Object.entries(errores)) {
      if (control.hasError(error)) return this.MESSAGES[mensaje];
    }
    if (campo === 'confirmarNuevaContrasena' && this.formulario.hasError('noCoinciden')) {
      return this.MESSAGES.MISMATCH;
    }
    return null;
  }

  enviar(): void {
    if (this.enviando() || this.exito()) return;
    this.errorGeneral.set(null);
    const correo = this.formulario.controls.correoElectronico;
    correo.setValue(correo.value.trim().toLowerCase());
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.authService.recuperarContrasena(this.formulario.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.exito.set(true);
          this.formulario.reset();
          this.mostrarContrasena.set(false);
          this.mostrarConfirmacion.set(false);
        },
        error: (error: ErrorAuth) => {
          this.enviando.set(false);
          this.errorGeneral.set(error.estado === 400 ? 'VALIDATION'
            : error.estado === 404 ? 'NOT_FOUND'
            : error.codigo === 'SIN_CONEXION' ? 'CONNECTION'
            : error.codigo === 'TIEMPO_AGOTADO' ? 'TIMEOUT' : 'SERVER');
        },
      });
  }
}
