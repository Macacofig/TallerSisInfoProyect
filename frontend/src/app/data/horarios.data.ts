export interface OpcionHorario {
  etiqueta: string;
  horario: string;
}

export interface MateriaHorario {
  codigo: string;
  nombre: string;
  seleccionada: boolean;
  opciones: OpcionHorario[];
}

export const MATERIAS_HORARIOS: MateriaHorario[] = [
  {
    codigo: 'INF-101',
    nombre: 'Programación I',
    seleccionada: true,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Lunes 08:00-10:00 · Miércoles 08:00-10:00'
      },
      {
        etiqueta: 'Opción B:',
        horario: 'Martes 14:00-16:00 · Jueves 14:00-16:00'
      }
    ]
  },
  {
    codigo: 'INF-202',
    nombre: 'Estructuras de Datos',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Martes 09:30-10:45 · Miércoles 10:00-12:00'
      },
      {
        etiqueta: 'Opción B:',
        horario: 'Martes 08:00-10:00 · Jueves 08:00-10:00'
      }
    ]
  },
  {
    codigo: 'INF-305',
    nombre: 'Bases de Datos',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Lunes 14:00-16:00 · Miércoles 14:00-16:00'
      },
      {
        etiqueta: 'Opción B:',
        horario: 'Martes 10:00-12:00 · Jueves 10:00-12:00'
      }
    ]
  },
  {
    codigo: 'INF-410',
    nombre: 'Ingeniería de Software',
    seleccionada: false,
    opciones: [
      {
        etiqueta: 'Opción A:',
        horario: 'Viernes 08:00-11:00'
      }
    ]
  }
];