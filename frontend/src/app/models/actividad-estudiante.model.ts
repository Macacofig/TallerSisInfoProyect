export type EstadoActividad = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'REALIZADO';

export interface ActividadEstudiante {
  id: number;
  idEstudiante: number;
  titulo: string;
  descripcion: string;
  // Fecha local de America/La_Paz sin offset; conservar el valor recibido.
  fechaHoraRegistro: string;
  estado: EstadoActividad;
}
