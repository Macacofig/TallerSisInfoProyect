/**
 * Textos de la pantalla de horarios.
 * Todos los textos visibles de la interfaz viven aquí.
 */
export const HORARIOS_MESSAGES = {
  PLANNING: 'Planificación',
  TITLE: 'Generador de horarios',
  DESCRIPTION:
    'Elige tus materias y sus opciones horarias. Descartamos automáticamente las combinaciones con cruces.',

  SEMESTER_SUBJECTS: 'Materias del semestre',
  OPTION_LABEL: 'Opción',
  SELECT_SUBJECT: 'Seleccionar',
  SUBJECT_NAMES: {
    'INF-101': 'Programación I',
    'INF-202': 'Estructuras de Datos',
    'INF-305': 'Bases de Datos',
    'INF-410': 'Ingeniería de Software',
  },

  HOUR: 'Hora',
  OPTIONS_FOUND: 'Opciones horarias disponibles:',
  PREVIOUS: 'Anterior',
  NEXT: 'Siguiente',

  EMPTY_STATE:
    'Selecciona al menos una materia para ver sus opciones horarias.',

  DAYS: [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
} as const;