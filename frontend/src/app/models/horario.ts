export interface HorarioBloqueRequest {
  docenteNombre: string;
  dia: number; // 1 = Lunes ... 7 = Domingo
  horas: string; // "HH:mm - HH:mm"
}

export interface HorarioMateriaRequest {
  siglaMateria: string;
  paralelo: number;
  nombreMateria: string;
  horarios: HorarioBloqueRequest[];
}

export interface HorarioBloqueResponse {
  Dia: string; // nombre del día en español, p. ej. "Lunes"
  Horas: string; // "HH:mm - HH:mm"
}

export interface HorarioOfertaResponse {
  idDocente: number;
  Docente: string;
  Paralelo: number;
  Horarios: HorarioBloqueResponse[];
}

export interface HorarioMateriaResponse {
  idMateria: number;
  NombreMateria: string;
  Ofertas: HorarioOfertaResponse[];
}

export interface HorarioNormalizacionResponse {
  sessionId: string;
  materias: HorarioMateriaResponse[];
}

export interface HorarioCantidadRequest {
  min: number;
  max: number;
}

export interface HorarioFiltroRequest {
  cantidadMaterias: HorarioCantidadRequest;
  materiasObligatorias: number[];
  materiasExcluidas: number[];
  docentes: Record<number, number[]>;
  evitarHuecos: boolean;
}

export interface HorarioGeneracionRequest {
  sessionId: string;
  filtros: HorarioFiltroRequest;
}

export interface HorarioGeneradoBloque {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface HorarioGeneradoMateria {
  materia: string;
  docente: string;
  horarios: HorarioGeneradoBloque[];
}

export interface HorarioResponse2 {
  cantidadMaterias: number;
  puntuacion: number;
  horarios: HorarioGeneradoMateria[];
}


export interface HorarioCantidadRequest {
  min: number;
  max: number;
}

export interface HorarioFiltroRequest {
  cantidadMaterias: HorarioCantidadRequest;
  materiasObligatorias: number[];
  materiasExcluidas: number[];
  docentes: Record<number, number[]>;
  evitarHuecos: boolean;
}
