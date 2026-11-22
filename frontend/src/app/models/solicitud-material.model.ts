export interface SolicitudMaterialResponse {
  id: number;
  titulo: string;
  materia: string | null;
  docente: string | null;
  usuario: string | null;
  tipo: string | null;
  idEstudiante: number | null;
  nombreEstudiante?: string | null;
  idMaterial: number | null;
  linkMaterial: string | null;
  estado: string;
}
