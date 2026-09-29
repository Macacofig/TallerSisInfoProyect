import {
  compararGestiones,
  esGestionFutura,
  formatearGestion,
  obtenerGestionActual,
  obtenerIndiceGestion
} from './gestion.utils';

describe('gestion.utils', () => {

  it('debería obtener el primer semestre entre enero y junio', () => {

    expect(
      obtenerGestionActual(
        new Date(2026, 0, 15)
      )
    ).toBe('2026-1');

    expect(
      obtenerGestionActual(
        new Date(2026, 5, 30)
      )
    ).toBe('2026-1');
  });

  it('debería obtener el segundo semestre entre julio y diciembre', () => {

    expect(
      obtenerGestionActual(
        new Date(2026, 6, 1)
      )
    ).toBe('2026-2');

    expect(
      obtenerGestionActual(
        new Date(2026, 8, 29)
      )
    ).toBe('2026-2');
  });

  it('debería cambiar automáticamente de año', () => {

    expect(
      obtenerGestionActual(
        new Date(2027, 0, 1)
      )
    ).toBe('2027-1');
  });

  it('debería mostrar la gestión usando números romanos', () => {

    expect(
      formatearGestion('2026-1')
    ).toBe('2026-I');

    expect(
      formatearGestion('2026-2')
    ).toBe('2026-II');
  });

  it('debería conservar un valor que no tenga formato de gestión', () => {

    expect(
      formatearGestion('desconocida')
    ).toBe('desconocida');
  });

  it('debería identificar una gestión futura', () => {

    const fechaActual =
      new Date(2026, 8, 29);

    expect(
      esGestionFutura(
        '2027-1',
        fechaActual
      )
    ).toBe(true);

    expect(
      esGestionFutura(
        '2026-2',
        fechaActual
      )
    ).toBe(false);

    expect(
      esGestionFutura(
        '2026-1',
        fechaActual
      )
    ).toBe(false);
  });

  it('debería generar índices cronológicos comparables', () => {

    expect(
      obtenerIndiceGestion('2026-1')
    ).toBeLessThan(
      obtenerIndiceGestion('2026-2')
    );

    expect(
      obtenerIndiceGestion('2026-2')
    ).toBeLessThan(
      obtenerIndiceGestion('2027-1')
    );
  });

  it('debería ordenar gestiones cronológicamente', () => {

    const gestiones = [
      '2027-1',
      '2026-1',
      '2026-2'
    ];

    expect(
      gestiones.sort(compararGestiones)
    ).toEqual([
      '2026-1',
      '2026-2',
      '2027-1'
    ]);
  });
});
