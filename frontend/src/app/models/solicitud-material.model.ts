export interface SolicitudMaterialResponse {
  id: number;
  titulo: string;
  idEstudiante: number | null;
  nombreEstudiante: string | null;
  idMaterial: number | null;
  linkMaterial: string | null;
  estado: string;
}
