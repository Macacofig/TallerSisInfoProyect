/**
 * Mensajes y etiquetas de la interfaz de usuario
 */
export const MESSAGES = {

  // Headers y títulos
  MATERIAS_PAGE_EYEBROW: 'Biblioteca académica',
  MATERIAS_PAGE_TITLE: 'Materias',
  MATERIAS_PAGE_DESCRIPTION:
    'Conoce las materias y explora su información académica.',

  // Estados y contadores
  MATERIA_SINGULAR: 'materia disponible',
  MATERIA_PLURAL: 'materias disponibles',
  DEMO_NOTICE:
    'Datos de demostración: estas materias y sus indicadores son ficticios.',

  // Búsqueda de materias (HU-02)
  SEARCH_LABEL: 'Buscar',
  SEARCH_PLACEHOLDER: 'Nombre de la materia',
  SEARCH_CLEAR: 'Limpiar búsqueda',
  SEARCH_RESULT_SINGULAR: 'materia encontrada',
  SEARCH_RESULT_PLURAL: 'materias encontradas',
  SEARCH_EMPTY_TITLE: 'No se encontraron coincidencias',
  SEARCH_EMPTY_DESCRIPTION:
    'Prueba con otro nombre, o limpia la búsqueda para ver todas las materias.',

  // Filtro por carrera (HU-03)
  CAREER_LABEL: 'Carrera',
  CAREER_ALL: 'Todas',
  CAREER_EMPTY_TITLE:
    'No hay materias registradas para esta carrera',
  CAREER_EMPTY_DESCRIPTION:
    'Selecciona otra carrera o elige Todas para ver las materias disponibles.',
  CAREER_SEARCH_EMPTY_DESCRIPTION:
    'No hay materias que coincidan con el nombre y la carrera seleccionados. Prueba con otro nombre o cambia la carrera.',

  // Cargando
  LOADING_MESSAGE: 'Cargando materias…',

  // Errores
  ERROR_TITLE: 'No pudimos cargar las materias',
  ERROR_DESCRIPTION:
    'Revisa tu conexión e inténtalo nuevamente.',
  ERROR_BUTTON: 'Reintentar',

  // Sin datos
  EMPTY_TITLE: 'Aún no hay materias disponibles',
  EMPTY_DESCRIPTION:
    'Cuando se registren materias, podrás consultarlas aquí.',

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
  VIEW_DETAIL_BUTTON: 'Ver detalle y calificaciones',
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
  INDICATORS_WITHOUT_DATA:
    'Indicadores: sin datos disponibles',
  MATERIAS_SECTION_LABEL: 'Sección de materias',

  // HU-05.1 - Detalle y calificación de materia
  MATERIA_DETAIL_LOADING: 'Cargando materia...',
  MATERIA_DETAIL_CODE_LABEL: 'Código',
  MATERIA_DETAIL_SEMESTER_LABEL: 'Semestre',

  CALIFICATION_VERIFYING:
    'Verificando calificación...',

  CALIFICATION_BUTTON_CREATE:
    'Calificar materia',

  CALIFICATION_BUTTON_VIEW:
    'Ver calificación',

  CALIFICATION_REGISTERED_TITLE:
    'Calificación registrada',

  CALIFICATION_REGISTERED_DESCRIPTION:
    'Ya calificaste esta materia.',

  CALIFICATION_FORM_TITLE:
    'Calificar materia',

  CALIFICATION_FORM_DESCRIPTION:
    'Evalúa tu experiencia en esta materia.',

  CALIFICATION_CLOSE_BUTTON:
    'Cerrar',

  CALIFICATION_CANCEL_BUTTON:
    'Cancelar',

  CALIFICATION_CONTINUE_BUTTON:
    'Continuar',

  CALIFICATION_BACK_BUTTON:
    'Volver',

  CALIFICATION_CONFIRM_BUTTON:
    'Confirmar calificación',

  CALIFICATION_REGISTERING:
    'Registrando...',

  CALIFICATION_CONFIRM_TITLE:
    'Confirmar calificación',

  CALIFICATION_CONFIRM_DESCRIPTION:
    'Revisa los valores antes de registrar tu calificación.',

  CALIFICATION_SINGLE_NOTICE:
    'Solo puedes registrar una calificación por materia.',

  CALIFICATION_CONFIRM_NOTICE:
    'Solo puedes registrar una calificación por materia. Revisa los datos antes de confirmar.',

  CALIFICATION_SUBJECT_LABEL:
    'Materia',

  CALIFICATION_DIFFICULTY_LABEL:
    'Dificultad',

  CALIFICATION_WORKLOAD_LABEL:
    'Carga',

  CALIFICATION_PREVIOUS_KNOWLEDGE_LABEL:
    'Conocimiento previo',

  CALIFICATION_PREREQUISITES_LABEL:
    'Prerequisitos',

  CALIFICATION_DOMINANCE_LABEL:
    'Predominio',

  CALIFICATION_MANAGEMENT_LABEL:
    'Gestión',

  CALIFICATION_PRACTICAL_LABEL:
    'Práctico',

  CALIFICATION_THEORETICAL_LABEL:
    'Teórico',

  CALIFICATION_PREREQUISITES_PLACEHOLDER:
    'Ej: Programación básica, Lógica, Matemática',

  CALIFICATION_MANAGEMENT_PLACEHOLDER:
    'Ej: 2026-1',

  CALIFICATION_PREREQUISITES_REQUIRED:
    'Debes ingresar al menos un prerequisito.',

  CALIFICATION_MANAGEMENT_INVALID:
    'La gestión debe tener el formato AÑO-1 o AÑO-2.',

  CALIFICATION_INVALID_SUBJECT_ID:
    'El identificador de la materia no es válido.',

  CALIFICATION_INVALID_DATA:
    'Los datos de la calificación no son válidos.',

  CALIFICATION_SUBJECT_UNAVAILABLE:
    'La materia solicitada no está disponible.',

  CALIFICATION_REGISTER_ERROR:
    'No se pudo registrar la calificación. Intenta nuevamente.',

  CALIFICATION_SUBJECT_NOT_FOUND:
    'La materia solicitada no existe.',

  CALIFICATION_SUBJECT_LOAD_ERROR:
    'No se pudo cargar la información de la materia.',

  CALIFICATION_STATUS_ERROR:
    'No se pudo verificar si ya calificaste esta materia.',

  // HU-05.2 - Visualización de calificaciones
  CALIFICATION_SUMMARY_TITLE:
    'Resumen de calificaciones',

  CALIFICATION_SUMMARY_DESCRIPTION:
    'Información obtenida de las evaluaciones registradas.',

  CALIFICATION_SUMMARY_GENERAL_CONTEXT:
    'Promedio general de la materia',

  CALIFICATION_FILTER_APPLIED:
    'Filtro aplicado',

  CALIFICATION_MANAGEMENTS_LOADING:
    'Cargando gestiones...',

  CALIFICATION_DATA_LOADING:
    'Cargando datos de calificación...',

  CALIFICATION_SUMMARY_EMPTY:
    'No existen calificaciones suficientes para mostrar promedios.',

  CALIFICATION_SUMMARY_LOAD_ERROR:
    'No se pudieron cargar los datos de calificación de la materia.',

  CALIFICATION_MANAGEMENTS_LOAD_ERROR:
    'No se pudieron cargar las gestiones disponibles.',

  // HU-05.2 - Gráficos de calificación
  CALIFICATION_GRAPH_TITLE:
    'Métricas de calificación',

  CALIFICATION_GRAPH_DESCRIPTION:
    'Representación visual en una escala de 0 a 10.',

  CALIFICATION_GRAPH_DIFFICULTY_ARIA:
    'Promedio de dificultad',

  CALIFICATION_GRAPH_WORKLOAD_ARIA:
    'Promedio de carga',

  CALIFICATION_GRAPH_PREVIOUS_KNOWLEDGE_ARIA:
    'Promedio de conocimiento previo',

  // HU-05.2 - Filtro de gestiones
  CALIFICATION_FILTER_HISTORY_TITLE:
    'Historial por gestión',

  CALIFICATION_FILTER_HISTORY_DESCRIPTION:
    'Consulta rápidamente las gestiones más recientes o utiliza un rango personalizado.',

  CALIFICATION_FILTER_RECENT:
    'reciente',

  CALIFICATION_FILTER_CUSTOM_TITLE:
    'Consulta personalizada',

  CALIFICATION_FILTER_CUSTOM_DESCRIPTION:
    'Selecciona una gestión específica o un rango de gestiones.',

  CALIFICATION_FILTER_SINGLE_MODE:
    'Una gestión',

  CALIFICATION_FILTER_RANGE_MODE:
    'Rango de gestiones',

  CALIFICATION_FILTER_FROM_LABEL:
    'Desde',

  CALIFICATION_FILTER_TO_LABEL:
    'Hasta',

  CALIFICATION_FILTER_CLEAR_BUTTON:
    'Quitar filtro',

  CALIFICATION_FILTER_LOADING:
    'Consultando...',

  CALIFICATION_FILTER_APPLY_BUTTON:
    'Aplicar filtro',

  CALIFICATION_FILTER_MANAGEMENT_REQUIRED:
    'Selecciona una gestión.',

  CALIFICATION_FILTER_MANAGEMENT_EMPTY:
    'No existen calificaciones para la gestión seleccionada.',

  CALIFICATION_FILTER_MANAGEMENT_LOAD_ERROR:
    'No se pudieron cargar los datos de la gestión.',

  CALIFICATION_FILTER_MANAGEMENT_CONTEXT:
    'Promedio general de la gestión',

  CALIFICATION_FILTER_RANGE_REQUIRED:
    'Selecciona la gestión inicial y final.',

  CALIFICATION_FILTER_RANGE_INVALID:
    'La gestión inicial no puede ser posterior a la final.',

  CALIFICATION_FILTER_RANGE_EMPTY:
    'No existen calificaciones para el rango seleccionado.',

  CALIFICATION_FILTER_RANGE_LOAD_ERROR:
    'No se pudieron cargar los datos del rango.',

  CALIFICATION_FILTER_RANGE_CONTEXT:
    'Promedio general del rango',

  CALIFICATION_FILTER_RANGE_SEPARATOR:
    'a',

  // HU-05.2 - Historial de calificaciones
  CALIFICATION_HISTORY_TITLE:
    'Evolución histórica por gestión',

  CALIFICATION_HISTORY_DESCRIPTION:
    'Comparación general de las calificaciones registradas a lo largo de las gestiones.',

  CALIFICATION_HISTORY_LOADING:
    'Cargando historial...',

  CALIFICATION_HISTORY_LOAD_ERROR:
    'No se pudo cargar el historial de calificaciones.',

  CALIFICATION_HISTORY_ARIA:
    'Evolución histórica de las calificaciones por gestión',

  CALIFICATION_HISTORY_NOTE:
    'El historial corresponde a los promedios generales disponibles por gestión.',

  CALIFICATION_HISTORY_EMPTY:
    'No existen suficientes gestiones para construir el historial.',

} as const;