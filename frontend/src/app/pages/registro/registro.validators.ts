import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Obligatorio, ignorando espacios al inicio y al final.
 */
export const requeridoSinEspacios: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const valor = String(control.value ?? '').trim();

  return valor.length === 0 ? { required: true } : null;
};


/**
 * Longitud mínima, ignorando espacios al inicio y al final.
 */
export function longitudMinimaSinEspacios(minimo: number): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    const valor = String(control.value ?? '').trim();

    if (valor.length === 0) return null;

    return valor.length < minimo
      ? {
          minlength: {
            requiredLength: minimo,
            actualLength: valor.length
          }
        }
      : null;
  };
}


/**
 * Formato de correo válido.
 */
export const correoValido: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const valor = String(control.value ?? '').trim();

  if (valor.length === 0) return null;

  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return patron.test(valor)
    ? null
    : { correo: true };
};


/**
 * El correo debe pertenecer al dominio UCB.
 */
export const correoUcb: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const valor = String(control.value ?? '').trim().toLowerCase();

  if (valor.length === 0) return null;

  return valor.endsWith('@ucb.edu.bo')
    ? null
    : { correoUcb: true };
};


/**
 * Teléfono:
 * - exactamente 8 dígitos
 * - debe empezar por 6 o 7
 */
export const telefonoValido: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const valor = String(control.value ?? '').trim();

  if (valor.length === 0) return null;

  const patron = /^[67][0-9]{7}$/;

  return patron.test(valor)
    ? null
    : { telefono: true };
};


/**
 * Contraseña:
 * - mínimo 8 caracteres
 * - una mayúscula
 * - un número
 * - un carácter especial
 */
export const contrasenaValida: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const valor = String(control.value ?? '');

  if (valor.length === 0) return null;

  const errores: ValidationErrors = {};

  if (valor.length < 8) {
    errores['passwordMinLength'] = true;
  }

  if (!/[A-Z]/.test(valor)) {
    errores['passwordUppercase'] = true;
  }

  if (!/[0-9]/.test(valor)) {
    errores['passwordNumber'] = true;
  }

  if (!/[^A-Za-z0-9]/.test(valor)) {
    errores['passwordSpecial'] = true;
  }

  return Object.keys(errores).length > 0 ? errores : null;
};