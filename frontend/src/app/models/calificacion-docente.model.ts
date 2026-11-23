export type GestionDocente = string;

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

export interface CalificacionDocentePromedioResponse {
  idDocente: number;
  gestionDesde: string | null;
  gestionHasta: string | null;
  claridadExplicacionesPromedio: number;
  metodologiaPromedio: number;
  relacionClasesEvaluacionesPromedio: number;
  idMateria: number;
  nombreDocente: string;
}

export interface CalificacionDocenteGestionResumenResponse {
  gestion: GestionDocente;
  anio: number | null;
  semestre: 'I' | 'II' | null;
  gestionesOriginales: GestionDocente[];
  cantidadEvaluaciones: number;
  docentes: CalificacionDocenteGestionDocenteResumen[];
}

export interface CalificacionDocenteGestionDocenteResumen {
  idDocente: number;
  nombreDocente: string;
  cantidadEvaluaciones: number;
  claridadExplicacionesPromedio: number;
  metodologiaPromedio: number;
  relacionClasesEvaluacionesPromedio: number;
}
