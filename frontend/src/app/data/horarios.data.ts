export interface OpcionHorario {
  docente: string;
  paralelo: number;
  horario: string;
}

export interface MateriaHorario {
  codigo: string;
  nombre: string;
  seleccionada: boolean;
  opciones: OpcionHorario[];
}
