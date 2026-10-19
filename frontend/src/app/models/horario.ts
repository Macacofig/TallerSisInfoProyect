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
