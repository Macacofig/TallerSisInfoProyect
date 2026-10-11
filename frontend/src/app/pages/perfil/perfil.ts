import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { PERFIL_MESSAGES } from '../../strings/perfil/perfil.messages';
import { PERFIL_MESSAGES_EN } from '../../strings/perfil/perfil-ingles.messages';

type PerfilMessageKey = keyof typeof PERFIL_MESSAGES;

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {

  private readonly languageService = inject(LanguageService);

  get MESSAGES() {
    return this.languageService.getMessages(PERFIL_MESSAGES, PERFIL_MESSAGES_EN);
  }

  readonly modalVisible = signal(false);
  readonly modalExito = signal(false);
  readonly modalMensaje = signal<PerfilMessageKey | ''>('');

  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly usuario = this.authService.obtenerUsuario();

  readonly formulario = this.formBuilder.group({
    nombre: [
      this.usuario?.nombre ?? ''
    ],

    telefono: [
      this.usuario?.telefono ?? ''
    ],

    carrera: [
      this.usuario?.carrera ?? ''
    ]
  });

  guardarCambios(): void {
    if (!this.usuario) {
      return;
    }

    const valores = this.formulario.getRawValue();

    const datos = {
      nombre: valores.nombre.trim(),
      telefono: valores.telefono.trim(),
      carrera: valores.carrera.trim()
    };

    if (!datos.nombre) {
      this.mostrarError('ERROR_NAME_REQUIRED');
      return;
    }

    if (!/^[67]\d{7}$/.test(datos.telefono)) {
      this.mostrarError('ERROR_PHONE_INVALID');
      return;
    }

    if (!datos.carrera) {
      this.mostrarError('ERROR_CAREER_REQUIRED');
      return;
    }

    this.authService
      .actualizarUsuario(this.usuario.id, datos)
      .subscribe({
        next: (usuarioActualizado) => {
          this.authService.guardarUsuario(usuarioActualizado);

          this.modalExito.set(true);

          this.modalMensaje.set(
            'SUCCESS_MESSAGE'
          );

          this.modalVisible.set(true);
        },

        error: (error) => {
          this.modalExito.set(false);

          if (error?.codigo === 'SIN_CONEXION') {
            this.modalMensaje.set(
              'ERROR_CONNECTION'
            );
          } else {
            this.modalMensaje.set(
              'ERROR_SAVE'
            );
          }

          this.modalVisible.set(true);
        }
      });
  }

  private mostrarError(mensaje: PerfilMessageKey): void {
    this.modalExito.set(false);
    this.modalMensaje.set(mensaje);
    this.modalVisible.set(true);
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
  }
}