
/**
 * Datos de demostración para los ayudantes de las materias.
 */

export interface Ayudante {
  id: number;
  iniciales: string;
  nombre: string;
  verificado: boolean;
  horario: string;
  calificacion: number;
  totalCalificaciones: number;
}

export const AYUDANTES: Ayudante[] = [
  {
    id: 1,
    iniciales: 'AT',
    nombre: 'Ana Torres',
    verificado: true,
    horario: 'Lun 16:00-18:00 · Mié 16:00-18:00',
    calificacion: 4.8,
    totalCalificaciones: 5,
  },
];
