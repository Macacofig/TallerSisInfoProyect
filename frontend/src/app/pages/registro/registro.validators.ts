import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Correo con formato usuario@dominio.ext (exige punto en el dominio). */
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Obligatorio, ignorando espacios al inicio y al final. */
export const requeridoSinEspacios: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const valor = String(control.value ?? '').trim();
  return valor.length === 0 ? { required: true } : null;
};

/** Longitud mínima, ignorando espacios al inicio y al final. */
export function longitudMinimaSinEspacios(minimo: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '').trim();
    // Si está vacío lo resuelve `requeridoSinEspacios`.
    if (valor.length === 0) return null;
    return valor.length < minimo
      ? { minlength: { requiredLength: minimo, actualLength: valor.length } }
      : null;
  };
}

/** Formato de correo válido. Si está vacío no se queja (lo resuelve el "requerido"). */
export const correoValido: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const valor = String(control.value ?? '').trim();
  if (valor.length === 0) return null;
  return PATRON_CORREO.test(valor) ? null : { correo: true };
};
