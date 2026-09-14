export interface Indicador {
  valor: number; // 0-10
  total: number; // siempre 10
}

export interface Materia {
  id: number;
  codigo: string;
  nombre: string;
  carrera: string;
  semestre: number;
  // Campos de HU-04 opcionales hasta que la API incluya esta información.
  descripcion?: string | null;
  conocimientosPreviosRecomendados?: string | null;
  dificultad?: Indicador;
  cargaTrabajo?: Indicador;
  conocimientosPrevios?: Indicador;
  predominio?: 'Teórico' | 'Práctico';
  cantidadEstudiantesEvaluados?: number;
}
