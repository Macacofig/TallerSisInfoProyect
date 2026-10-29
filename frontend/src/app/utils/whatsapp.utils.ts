export const BOLIVIA_COUNTRY_CODE = '591';

export function normalizarTelefonoWhatsApp(telefono: string | null | undefined): string | null {
  const digitos = (telefono ?? '').replace(/\D/g, '');

  if (/^[67]\d{7}$/.test(digitos)) {
    return `${BOLIVIA_COUNTRY_CODE}${digitos}`;
  }

  if (/^591[67]\d{7}$/.test(digitos)) {
    return digitos;
  }

  return null;
}

export function construirEnlaceWhatsApp(
  telefono: string | null | undefined,
  mensaje: string
): string | null {
  const telefonoNormalizado = normalizarTelefonoWhatsApp(telefono);
  if (!telefonoNormalizado) {
    return null;
  }

  return `https://wa.me/${telefonoNormalizado}?text=${encodeURIComponent(mensaje)}`;
}
