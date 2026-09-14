export type PredominioMateria =
  'Practico' |
  'Teorico';

export interface RegistrarCalificacionMateriaRequest {
  idMateria: number;
  idEstudiante: number | null;
  dificultad: number;
  carga: number;
  conocimientoPrevio: number;
  prerequisitos: string[];
  predominio: PredominioMateria;
  gestion: string;
}

export interface CalificacionMateriaResponse {
  id: number;
  idMateria: number;
  idEstudiante: number | null;
  dificultad: number;
  carga: number;
  conocimientoPrevio: number;
  prerequisitosText: string;
  predominio: PredominioMateria;
  gestion: string;
}

export interface CalificacionMateriaPromedioResponse {
  idMateria: number | null;
  gestionDesde: string | null;
  gestionHasta: string | null;
  dificultadPromedio: number;
  cargaPromedio: number;
  conocimientoPrevioPromedio: number;
}