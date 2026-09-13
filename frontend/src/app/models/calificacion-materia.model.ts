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