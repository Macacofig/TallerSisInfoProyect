export type GestionDocente =
  'año-I' |
  'año-II';

export interface RegistrarCalificacionDocenteRequest {
  idDocente: number;
  idMateria: number;
  idEstudiante: number | null;
  claridadExplicaciones: number;
  metodologia: number;
  relacionClasesEvaluaciones: number;
  gestion: GestionDocente;
}

export interface CalificacionDocenteResponse {
  id: number;
  idDocente: number;
  idMateria: number;
  idEstudiante: number | null;
  claridadExplicaciones: number;
  metodologia: number;
  relacionClasesEvaluaciones: number;
  gestion: GestionDocente;
}