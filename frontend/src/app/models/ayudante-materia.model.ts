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
