import { formatearFechaActividad } from './fecha-actividad';

describe('Fecha local de actividad', () => {
  it('mantiene la fecha y hora de Bolivia sin desplazamientos', () => {
    expect(formatearFechaActividad('2026-11-08T23:30:00.123456', 'es')).toBe('08/11/2026, 23:30');
    expect(formatearFechaActividad('2026-11-08T23:30:00.123456', 'en')).toBe('11/08/2026, 23:30');
    expect(formatearFechaActividad('2026-01-01T00:15:00', 'es')).toBe('01/01/2026, 00:15');
  });

  it('acepta días bisiestos válidos', () => {
    expect(formatearFechaActividad('2024-02-29T08:05:00', 'es')).toBe('29/02/2024, 08:05');
    expect(formatearFechaActividad('2000-02-29T08:05', 'en')).toBe('02/29/2000, 08:05');
  });

  it.each([
    '', 'no es una fecha', '0000-01-01T00:00:00', '2026-02-29T08:05:00', '1900-02-29T08:05:00',
    '2026-04-31T08:05:00', '2026-00-01T08:05:00', '2026-13-01T08:05:00', '2026-01-00T08:05:00',
    '2026-11-08T24:00:00', '2026-11-08T10:60:00', '2026-11-08T10:30:60',
    '2026-11-08T10:30:00Z', '2026-11-08T10:30:00-04:00'
  ])('rechaza la fecha inválida o ajena al contrato local: %s', fecha => {
    expect(formatearFechaActividad(fecha, 'es')).toBeNull();
  });
});
