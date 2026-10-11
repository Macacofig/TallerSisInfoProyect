import { MateriaHorario } from './horarios.data';

export interface MateriaDisponible extends MateriaHorario {
  semestre: number;
}

export const MATERIAS_DISPONIBLES: MateriaDisponible[] = [
  {
    semestre: 1,
    codigo: 'MAT-123',
    nombre: 'Álgebra Lineal',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Lunes 10:15-12:00 · Miércoles 10:15-12:00'
      },
      {
        etiqueta: 'Opción B:',
        horario: 'Martes 10:15-12:00 · Jueves 10:15-12:00'
      }
    ]
  },
  {
    semestre: 1,
    codigo: 'MAT-122',
    nombre: 'Matemáticas Discretas',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Lunes 14:00-16:00 · Miércoles 14:00-16:00'
      },
      {
        etiqueta: 'Opción B:',
        horario: 'Martes 14:00-16:00 · Jueves 14:00-16:00'
      }
    ]
  },
  {
    semestre: 1,
    codigo: 'SIS-111',
    nombre: 'Introducción a la Programación',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Martes 08:00-10:00 · Jueves 08:00-10:00'
      },
      {
        etiqueta: 'Opción B:',
        horario: 'Lunes 16:15-18:00 · Miércoles 16:15-18:00'
      }
    ]
  },
  {
    semestre: 1,
    codigo: 'SIS-121',
    nombre: 'Ingeniería de Sistemas',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Viernes 08:00-10:00'
      }
    ]
  },
  {
    semestre: 1,
    codigo: 'FIL-107',
    nombre: 'Pensamiento Crítico',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Lunes 12:30-14:00 · Miércoles 12:30-14:00'
      }
    ]
  },
  {
    semestre: 2,
    codigo: 'MAT-132',
    nombre: 'Cálculo I',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Lunes 08:00-10:00 · Miércoles 08:00-10:00'
      },
      {
        etiqueta: 'Opción B:',
        horario: 'Martes 10:15-12:00 · Jueves 10:15-12:00'
      }
    ]
  },
  {
    semestre: 2,
    codigo: 'MAT-142',
    nombre: 'Probabilidad y Estadística I',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Martes 12:30-14:00 · Jueves 12:30-14:00'
      }
    ]
  },
  {
    semestre: 2,
    codigo: 'SIS-133',
    nombre: 'Arquitectura Computacional y Sistemas Operativos',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Lunes 14:00-16:00 · Miércoles 14:00-16:00'
      },
      {
        etiqueta: 'Opción B:',
        horario: 'Martes 16:15-18:00 · Jueves 16:15-18:00'
      }
    ]
  },
  {
    semestre: 3,
    codigo: 'SIS-122',
    nombre: 'Bases de Datos I',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Martes 14:00-16:00 · Jueves 14:00-16:00'
      }
    ]
  }
];