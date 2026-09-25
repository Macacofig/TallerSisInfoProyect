import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { ErrorAuth } from '../../models/registrar';
import { LoginRequest } from '../../models/login';
import { LOGIN_MESSAGES } from '../../strings/login/login.messages';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  readonly MESSAGES = LOGIN_MESSAGES;

  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly enviando = signal(false);
  readonly intentoEnvio = signal(false);
  readonly errorGeneral = signal<string | null>(null);

  readonly mostrarContrasena = signal(false);

  alternarContrasena(): void {
    this.mostrarContrasena.update(valor => !valor);
  }

  readonly formulario = this.formBuilder.group({
    correo: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@ucb\.edu\.bo$/)
      ]
    ],

    contrasena: [
      '',
      [
        Validators.required
      ]
    ]
  });

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

  mensajeError(campo: 'correo' | 'contrasena'): string | null {

    const control = this.formulario.controls[campo];

    if (!control.errors || !(control.touched || this.intentoEnvio())) {
      return null;
    }

    const errores = control.errors;

    if (errores['servidor']) {
      return errores['servidor'];
    }

    if (campo === 'correo') {

      if (errores['required']) {
        return this.MESSAGES.ERROR_EMAIL_REQUIRED;
      }

      if (errores['email'] || errores['pattern']) {
        return this.MESSAGES.ERROR_EMAIL_INVALID;
      }

    }

    if (campo === 'contrasena') {

      if (errores['required']) {
        return this.MESSAGES.ERROR_PASSWORD_REQUIRED;
      }

    }

    return null;
  }

  enviar(): void {
    if (this.enviando()) {
      return;
    }

    this.intentoEnvio.set(true);
    this.errorGeneral.set(null);

    const correoNormalizado = this.formulario.controls.correo.value
      .trim()
      .toLowerCase();

    this.formulario.controls.correo.setValue(correoNormalizado);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();

    const datos: LoginRequest = {
      correoElectronico: valores.correo,
      contrasena: valores.contrasena
    };

    this.enviando.set(true);

    this.authService
      .loginUser(datos)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({

        next: () => {
          this.enviando.set(false);

          this.router.navigate(['/home']);
        },

        error: (error: ErrorAuth) => {
          this.enviando.set(false);
          this.manejarError(error);
        }

      });
  }

  private manejarError(error: ErrorAuth): void {

    switch (error?.codigo) {

      case 'VALIDACION':
        this.errorGeneral.set(
          this.MESSAGES.ERROR_VALIDATION_SERVER
        );
        break;

      case 'SIN_CONEXION':
        this.errorGeneral.set(
          this.MESSAGES.ERROR_CONNECTION
        );
        break;

      case 'TIEMPO_AGOTADO':
        this.errorGeneral.set(
          this.MESSAGES.ERROR_TIMEOUT
        );
        break;

      default:
        this.errorGeneral.set(
          this.MESSAGES.ERROR_INVALID_CREDENTIALS
        );
    }
  }
  
}