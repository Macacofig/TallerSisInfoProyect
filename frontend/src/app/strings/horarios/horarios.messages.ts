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
    'Ingresa los datos de cada materia y sus horarios, luego agrégalas a la lista.',
  CLOSE_MODAL: 'Cerrar modal',
  SEMESTER: 'Semestre',
  SEMESTER_OPTION_SUFFIX: '.º semestre',
  ADD_SUBJECTS_EMPTY:
    'No hay materias disponibles para agregar en este semestre.',
  CANCEL: 'Cancelar',
  ADD_SELECTED: 'Agregar seleccionadas',
  SIGLA: 'Sigla',
  SUBJECT_NAME: 'Nombre de la materia',
  PARALLEL: 'Paralelo',
  TEACHER: 'Docente',
  DAY: 'Día',
  START_TIME: 'Hora inicio',
  END_TIME: 'Hora fin',
  SCHEDULE_BLOCKS: 'Horarios de la materia',
  ADD_SCHEDULE_BLOCK: 'Agregar horario',
  ADD_TO_LIST: 'Añadir a la lista',
  SUBJECTS_TO_SEND: 'Materias a enviar',
  SUBJECTS_TO_SEND_EMPTY: 'Aún no has agregado materias a la lista.',
  SEND_SUBJECTS: 'Enviar materias',
  REMOVE: 'Quitar',
  NO_OFFERS: 'Sin ofertas disponibles.',
  SHOW_OFFERS: 'Ver docentes y horarios',
  HIDE_OFFERS: 'Ocultar docentes y horarios',
  REUSE: 'Reutilizar',
  DUPLICATE_SUBJECT:
    'Ese docente ya está agregado con el mismo paralelo para esta materia.',
  DOWNLOAD_DESCRIPTION:
    'Revisa el horario seleccionado antes de continuar.',
  SCHEDULE_OPTION_OF: 'de',
  SELECTED_SUBJECT: 'materia seleccionada',
  SELECTED_SUBJECTS: 'materias seleccionadas',
  INCLUDED_SUBJECTS: 'Materias incluidas',
  SELECTED_SUBJECTS_EMPTY: 'No hay materias seleccionadas para mostrar.',
  CONFIRM: 'Confirmar',

  FILTERS: 'Filtros de generación',
  COUNT_SUBJECTS: 'Cantidad de materias',
  MIN_SUBJECTS: 'Cantidad mínima de materias',
  MAX_SUBJECTS: 'Cantidad máxima de materias',
  NO_GAPS: 'Evitar huecos',
  REQUIRED_SUBJECT: 'Obligatoria',
  EXCLUDE_SUBJECT: 'Excluir',
  TEACHER_REQUIRED: 'Obligatorio',
  TEACHER_FREE: 'Libre',

  DAYS: [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
} as const;