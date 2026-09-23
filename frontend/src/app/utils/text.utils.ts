const DIACRITICOS = /[\u0300-\u036f]/g;
const ESPACIOS = /\s+/g;

const CORRECCIONES_MATERIAS = new Map<string, string>([
  ['algebra', 'álgebra'],
  ['ingenieria', 'ingeniería'],
  ['introduccion', 'introducción'],
  ['matematica', 'matemática'],
  ['matematicas', 'matemáticas'],
  ['programacion', 'programación'],
]);

/** Devuelve una representación estable para búsquedas y comparaciones. */
export function normalizarTexto(texto: string | null | undefined): string {
  return (texto ?? '')
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .trim()
    .replace(ESPACIOS, ' ');
}

export function contieneTexto(texto: string, termino: string): boolean {
  return normalizarTexto(texto).includes(normalizarTexto(termino));
}

/** Corrige la presentación sin alterar el valor original recibido de la API. */
export function presentarNombreMateria(nombre: string): string {
  const limpio = nombre.trim().replace(ESPACIOS, ' ');
  if (!limpio) return limpio;

  const esTodoMayuscula = limpio === limpio.toLocaleUpperCase('es');
  const esTodoMinuscula = limpio === limpio.toLocaleLowerCase('es');
  const base = esTodoMayuscula || esTodoMinuscula
    ? limpio.toLocaleLowerCase('es')
    : limpio;

  const corregido = base
    .split(/(\s+)/)
    .map(parte => CORRECCIONES_MATERIAS.get(normalizarTexto(parte)) ?? parte)
    .join('');

  return corregido.charAt(0).toLocaleUpperCase('es') + corregido.slice(1);
}
