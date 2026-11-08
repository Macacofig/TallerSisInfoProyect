import { AppLanguage } from '../../services/language.service';

/** Formatea componentes locales sin interpretar la fecha como un instante UTC. */
export function formatearFechaActividad(fecha: string, idioma: AppLanguage): string | null {
  if (typeof fecha !== 'string') return null;
  const partes = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?$/.exec(fecha);
  if (!partes) return null;

  const [, anio, mes, dia, hora, minuto, segundo = '00'] = partes;
  const year = Number(anio);
  const month = Number(mes);
  const day = Number(dia);
  const bisiesto = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const diasPorMes = [31, bisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > diasPorMes[month - 1]
      || Number(hora) > 23 || Number(minuto) > 59 || Number(segundo) > 59) {
    return null;
  }

  return idioma === 'en'
    ? `${mes}/${dia}/${anio}, ${hora}:${minuto}`
    : `${dia}/${mes}/${anio}, ${hora}:${minuto}`;
}
