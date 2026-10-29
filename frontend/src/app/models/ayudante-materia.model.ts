export interface AyudanteMateriaResponse {
  id: number;
  idEstudiante: number;
  nombreEstudiante: string;
  idMateria: number;
  codigoMateria: string;
  nombreMateria: string;
  horario: string;
  estado: string;
}

export interface SolicitudAyudaRequest {
  idEstudiante: number;
  idAyudante: number;
  idMateria: number;
  peticion: string;
}

export interface SolicitudAyudaResponse {
  id: number;
  idEstudiante: number;
  nombreEstudiante: string;
  idAyudante: number;
  nombreAyudante: string;
  idMateria: number;
  codigoMateria: string;
  nombreMateria: string;
  peticion: string;
  estado: string;
}

export interface SolicitudAyudanteRequest {
  idEstudiante: number;
  idMateria: number;
  motivo: string;
  calificacion: number;
  horarios: string;
}

export interface SolicitudAyudanteResponse {
  id: number;
  idEstudiante: number;
  nombreEstudiante: string;
  idMateria: number;
  codigoMateria: string;
  nombreMateria: string;
  motivo: string;
  calificacion: number;
  horarios: string;
  estado: string;
}

export interface EstudianteTelefonoResponse {
  telefono: string;
}
