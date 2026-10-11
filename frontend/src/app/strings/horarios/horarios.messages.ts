/**
 * Textos de la pantalla de horarios.
 * Todos los textos visibles de la interfaz viven aquí.
 */
export const HORARIOS_MESSAGES = {
  PLANNING: 'Planificación',
  TITLE: 'Generador de horarios',
  DESCRIPTION:
    'Elige tus materias y sus opciones horarias. Descartamos automáticamente las combinaciones con cruces.',
  ADD_SUBJECT: 'Agregar materia',
  DOWNLOAD_SCHEDULE: 'Descargar horario',

  SEMESTER_SUBJECTS: 'Materias del semestre',
  OPTION_LABEL: 'Opción',
  SELECT_SUBJECT: 'Seleccionar',
  PREVIOUS_SUBJECTS_PAGE: 'Página anterior de materias',
  NEXT_SUBJECTS_PAGE: 'Página siguiente de materias',
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
  ADD_SUBJECTS_TITLE: 'Agregar materias',
  ADD_SUBJECTS_DESCRIPTION:
    'Selecciona el semestre y las materias que deseas añadir.',
  CLOSE_MODAL: 'Cerrar modal',
  SEMESTER: 'Semestre',
  SEMESTER_OPTION_SUFFIX: '.º semestre',
  ADD_SUBJECTS_EMPTY:
    'No hay materias disponibles para agregar en este semestre.',
  CANCEL: 'Cancelar',
  ADD_SELECTED: 'Agregar seleccionadas',
  DOWNLOAD_DESCRIPTION:
    'Revisa el horario seleccionado antes de continuar.',
  SCHEDULE_OPTION_OF: 'de',
  SELECTED_SUBJECT: 'materia seleccionada',
  SELECTED_SUBJECTS: 'materias seleccionadas',
  INCLUDED_SUBJECTS: 'Materias incluidas',
  SELECTED_SUBJECTS_EMPTY: 'No hay materias seleccionadas para mostrar.',
  CONFIRM: 'Confirmar',

  DAYS: [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
} as const;