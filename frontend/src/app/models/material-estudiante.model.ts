import { MaterialResponse } from './material.model';

export type EstadoRevisionMaterial = 'PENDIENTE' | 'APROBADO' | 'NEGADO';

export interface MaterialEstudiante {
  id: number;
  titulo: string;
  materia: string | null;
  tipo: MaterialResponse['tipo'] | null;
  estado: EstadoRevisionMaterial;
}
