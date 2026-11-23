import { EstadoRevisionMaterial, MaterialEstudiante } from '../../models/material-estudiante.model';

export type FiltroEstadoMaterial = 'TODOS' | EstadoRevisionMaterial;
export type EstadoVisualMaterial = 'pendiente' | 'aprobado' | 'rechazado';

export function filtrarMateriales(
  materiales: readonly MaterialEstudiante[],
  titulo: string,
  estado: FiltroEstadoMaterial
): MaterialEstudiante[] {
  const termino = normalizarTexto(titulo);
  return materiales.filter(material =>
    (!termino || normalizarTexto(material.titulo).includes(termino))
    && (estado === 'TODOS' || material.estado === estado)
  );
}

export function estadoVisualMaterial(estado: EstadoRevisionMaterial): EstadoVisualMaterial {
  switch (estado) {
    case 'PENDIENTE':
      return 'pendiente';
    case 'APROBADO':
      return 'aprobado';
    case 'NEGADO':
      return 'rechazado';
  }
}

function normalizarTexto(valor: string): string {
  return valor.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}
