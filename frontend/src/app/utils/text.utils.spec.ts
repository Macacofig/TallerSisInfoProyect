import {
  normalizarTexto,
  presentarNombreMateria,
  presentarNombreMateriaPorCodigo
} from './text.utils';

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

  it('resuelve las traducciones aunque el código varíe en mayúsculas y conserva el nombre original si falta', () => {
    const traducciones = { 'MAT-123': 'Linear Algebra' };

    expect(presentarNombreMateriaPorCodigo(' mat-123 ', 'Álgebra lineal', traducciones))
      .toBe('Linear Algebra');
    expect(presentarNombreMateriaPorCodigo('new-999', '  materia nueva  ', traducciones, true))
      .toBe('  materia nueva  ');
    expect(presentarNombreMateriaPorCodigo('new-999', 'programacion 1', traducciones))
      .toBe('Programación 1');
  });
});
