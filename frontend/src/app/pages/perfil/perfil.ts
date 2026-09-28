import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {

  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly usuario = this.authService.obtenerUsuario();

  readonly formulario = this.formBuilder.group({
    nombre: [
      this.usuario?.nombre ?? ''
    ],

    correoElectronico: [
      this.usuario?.correoElectronico ?? ''
    ],

    telefono: [
      this.usuario?.telefono ?? ''
    ],

    carrera: [
      this.usuario?.carrera ?? ''
    ],

    contrasena: [
      ''
    ]
  });

  guardarCambios(): void {
    if (!this.usuario) {
      return;
    }

    const valores = this.formulario.getRawValue();

    const datos = {
      nombre: valores.nombre,
      contrasena: valores.contrasena,
      telefono: valores.telefono,
      correoElectronico: valores.correoElectronico,
      carrera: valores.carrera
    };

    console.log('Datos enviados al backend:', datos);
    
    this.authService
      .actualizarUsuario(this.usuario.id, datos)
      .subscribe({
        next: (usuarioActualizado) => {
          this.authService.guardarUsuario(usuarioActualizado);

          console.log('Perfil actualizado correctamente');
        },

        error: (error) => {
          console.error('Error al actualizar el perfil:', error);
        }
      });
}

}