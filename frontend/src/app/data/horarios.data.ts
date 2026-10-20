export type EstadoFiltroMateria = 'normal' | 'obligatoria' | 'excluida';

export interface OpcionHorario {
  idDocente: number;
  docente: string;
  paralelo: number;
  horario: string;
  obligatorio: boolean;
}

export interface MateriaHorario {
  codigo: string;
  nombre: string;
  seleccionada: boolean;
  idMateria: number;
  estadoFiltro: EstadoFiltroMateria;
  opciones: OpcionHorario[];
}
