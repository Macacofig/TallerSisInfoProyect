export interface MaterialResponse {
  id: number;
  linkMaterial: string;
  titulo: string;
  descripcion: string;
  tipo: 'IMAGEN' | 'WORD' | 'PDF' | 'POWERPOINT';
  idMateria: number;
  nombreMateria: string;
  idDocente: number;
  nombreDocente: string;
  semestreIngresado: number | null;
  estado: string;
}

export interface SolicitudMaterialResponse {
  id: number;
  titulo: string;
  idEstudiante: number;
  nombreEstudiante: string;
  idMaterial: number;
  linkMaterial: string;
  estado: string;
}

export interface MaterialSubidoResponse {
  material: MaterialResponse;
  solicitud: SolicitudMaterialResponse;
}
