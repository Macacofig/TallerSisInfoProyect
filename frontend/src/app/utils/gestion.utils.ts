const PATRON_GESTION = /^(\d{4})-(1|2)$/;

export function obtenerGestionActual(
  fecha: Date = new Date()
): string {

  const anio =
    fecha.getFullYear();

  const semestre =
    fecha.getMonth() < 6
      ? 1
      : 2;

  return `${anio}-${semestre}`;
}

export function formatearGestion(
  gestion: string
): string {

  const resultado =
    PATRON_GESTION.exec(gestion);

  if (!resultado) {
    return gestion;
  }

  const [, anio, semestre] =
    resultado;

  return `${anio}-${semestre === '1' ? 'I' : 'II'}`;
}

export function obtenerIndiceGestion(
  gestion: string
): number {

  const resultado =
    PATRON_GESTION.exec(gestion);

  if (!resultado) {
    return -1;
  }

  const anio =
    Number(resultado[1]);

  const semestre =
    Number(resultado[2]);

  return (
    anio * 2 +
    (semestre - 1)
  );
}

export function esGestionFutura(
  gestion: string,
  fecha: Date = new Date()
): boolean {

  const indiceGestion =
    obtenerIndiceGestion(gestion);

  const indiceActual =
    obtenerIndiceGestion(
      obtenerGestionActual(fecha)
    );

  return (
    indiceGestion >= 0 &&
    indiceGestion > indiceActual
  );
}

export function compararGestiones(
  primeraGestion: string,
  segundaGestion: string
): number {

  return (
    obtenerIndiceGestion(
      primeraGestion
    ) -
    obtenerIndiceGestion(
      segundaGestion
    )
  );
}
