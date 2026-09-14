/**
 * Mensajes y etiquetas de la interfaz de usuario
 */
export const MESSAGES = {
  // Headers y títulos
  MATERIAS_PAGE_EYEBROW: 'Biblioteca académica',
  MATERIAS_PAGE_TITLE: 'Materias',
  MATERIAS_PAGE_DESCRIPTION: 'Conoce las materias y explora su información académica.',

  // Estados y contadores
  MATERIA_SINGULAR: 'materia disponible',
  MATERIA_PLURAL: 'materias disponibles',
  DEMO_NOTICE: 'Datos de demostración: estas materias y sus indicadores son ficticios.',

  // Búsqueda de materias (HU-02)
  SEARCH_LABEL: 'Buscar',
  SEARCH_PLACEHOLDER: 'Nombre de la materia',
  SEARCH_CLEAR: 'Limpiar búsqueda',
  SEARCH_RESULT_SINGULAR: 'materia encontrada',
  SEARCH_RESULT_PLURAL: 'materias encontradas',
  SEARCH_EMPTY_TITLE: 'No se encontraron coincidencias',
  SEARCH_EMPTY_DESCRIPTION: 'Prueba con otro nombre, o limpia la búsqueda para ver todas las materias.',

  // Filtro por carrera (HU-03)
  CAREER_LABEL: 'Carrera',
  CAREER_ALL: 'Todas',
  CAREER_EMPTY_TITLE: 'No hay materias registradas para esta carrera',
  CAREER_EMPTY_DESCRIPTION: 'Selecciona otra carrera o elige Todas para ver las materias disponibles.',
  CAREER_SEARCH_EMPTY_DESCRIPTION: 'No hay materias que coincidan con el nombre y la carrera seleccionados. Prueba con otro nombre o cambia la carrera.',

  // Cargando
  LOADING_MESSAGE: 'Cargando materias…',

  // Errores
  ERROR_TITLE: 'No pudimos cargar las materias',
  ERROR_DESCRIPTION: 'Revisa tu conexión e inténtalo nuevamente.',
  ERROR_BUTTON: 'Reintentar',

  // Sin datos
  EMPTY_TITLE: 'Aún no hay materias disponibles',
  EMPTY_DESCRIPTION: 'Cuando se registren materias, podrás consultarlas aquí.',

  // Indicadores y niveles
  DIFFICULTY_LABEL: 'Dificultad',
  WORKLOAD_LABEL: 'Carga de trabajo',
  PREREQUISITES_LABEL: 'Conocimientos previos',
  DOMINANCE_LABEL: 'Predominio',
  STUDENTS_EVALUATED_LABEL: 'Evaluaciones',
  NO_DATA: 'Sin datos',

  // Niveles de semestre
  LEVEL_BASIC: 'Básico',
  LEVEL_INTERMEDIATE: 'Intermedio',
  LEVEL_ADVANCED: 'Avanzado',

  // Evaluaciones
  STUDENT_EVALUATED_SINGULAR: 'estudiante evaluó',
  STUDENT_EVALUATED_PLURAL: 'estudiantes evaluaron',
  EVALUATIONS_UNAVAILABLE: 'Evaluaciones no disponibles',
  STUDENTS_EVALUATED_SUFFIX: 'esta materia',

  // Botones y acciones
  EXPLORE_BUTTON: 'Explorar materia',
  BACK_TO_CATALOG_BUTTON: 'Volver al catálogo',

  // Modal y diálogos
  MODAL_EYEBROW: 'Información de la materia',
  MODAL_CODE_LABEL: 'Código',
  MODAL_CAREER_LABEL: 'Carrera',
  MODAL_SEMESTER_LABEL: 'Semestre',
  MODAL_DOMINANCE_LABEL: 'Predominio',
  MODAL_DIFFICULTY_LABEL: 'Dificultad',
  MODAL_WORKLOAD_LABEL: 'Carga de trabajo',
  MODAL_PREREQUISITES_LABEL: 'Conocimientos previos',
  MODAL_EVALUATIONS_LABEL: 'Evaluaciones',
  MODAL_STUDENTS_SUFFIX: 'estudiantes',

  // Aria labels y accessibility
  INDICATORS_WITH_DATA: 'Indicadores de la materia',
  INDICATORS_WITHOUT_DATA: 'Indicadores: sin datos disponibles',
  MATERIAS_SECTION_LABEL: 'Sección de materias',
} as const;
