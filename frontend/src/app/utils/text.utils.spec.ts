import { normalizarTexto, presentarNombreMateria } from './text.utils';

describe('utilidades de texto', () => {
  it.each([
    [' programacion ', 'programacion'],
    ['Programación', 'programacion'],
    ['PROGRAMACIÓN', 'programacion'],
    ['  ingeniería   de sistemas  ', 'ingenieria de sistemas'],
  ])('normaliza "%s" como "%s"', (entrada, esperado) => {
    expect(normalizarTexto(entrada)).toBe(esperado);
  });

  it.each([
    ['algebra lineal', 'Álgebra lineal'],
    ['matematicas discretas', 'Matemáticas discretas'],
    ['introduccion a la programacion', 'Introducción a la programación'],
    ['ingenieria de sistemas', 'Ingeniería de sistemas'],
  ])('presenta "%s" como "%s"', (entrada, esperado) => {
    expect(presentarNombreMateria(entrada)).toBe(esperado);
  });

  it('conserva un nombre canónico proporcionado por el backend', () => {
    expect(presentarNombreMateria('Programación I')).toBe('Programación I');
  });
});
