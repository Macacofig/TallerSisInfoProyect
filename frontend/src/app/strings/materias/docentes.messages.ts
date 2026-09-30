export const DOCENTES_MESSAGES = {
  TITLE: 'Docentes',
  DESCRIPTION: 'Consulta y evalúa a los docentes registrados para esta materia.',

  LOADING: 'Cargando docentes...',
  LOAD_ERROR: 'No se pudieron cargar los docentes de esta materia.',
  STATUS_ERROR: 'Los docentes se cargaron, pero no se pudo verificar el estado de algunas evaluaciones.',
  AVERAGES_LOADING: 'Actualizando promedios de docentes...',
  AVERAGES_ERROR: 'Los docentes se cargaron, pero no se pudieron obtener sus promedios.',
  NO_AVERAGES: 'Este docente todavía no tiene promedios disponibles.',
  GESTIONS_ERROR: 'No se pudieron cargar las gestiones de calificación.',
  HISTORY_TITLE: 'Historial de calificaciones',
  HISTORY_DESCRIPTION: 'Consulta los promedios de docentes por gestión.',
  CUSTOM_FILTER_TITLE: 'Consulta personalizada',
  CUSTOM_FILTER_DESCRIPTION: 'Selecciona una gestión o un rango para filtrar los promedios.',
  RECENT: 'Reciente',
  SINGLE_MODE: 'Una gestión',
  RANGE_MODE: 'Rango de gestiones',
  MANAGEMENT_LABEL: 'Gestión',
  FROM_LABEL: 'Desde',
  TO_LABEL: 'Hasta',
  APPLY_FILTER: 'Aplicar filtro',
  FILTER_GESTION_REQUIRED: 'Selecciona una gestión para continuar.',
  FILTER_RANGE_REQUIRED: 'Selecciona las gestiones inicial y final.',
  FILTER_RANGE_INVALID: 'La gestión inicial no puede ser posterior a la final.',
  FILTER_GESTION_CONTEXT: 'Promedios de docentes en',
  FILTER_RANGE_CONTEXT: 'Promedios de docentes entre',
  FILTER_RANGE_SEPARATOR: 'y',
  FILTER_ERROR: 'No se pudieron consultar los promedios de esa gestión.',
  FILTER_LOADING: 'Actualizando promedios para la selección...',
  FILTER_EMPTY: 'No hay calificaciones de docentes para la selección.',
  MANAGEMENTS_LOADING: 'Cargando gestiones disponibles...',
  RESET_FILTER: 'Ver todos los periodos',
  HISTORY_LOADING: 'Cargando historial de docentes...',
  HISTORY_ERROR: 'No se pudo cargar el historial de calificaciones.',
  HISTORY_EMPTY: 'Aún no hay suficientes gestiones para mostrar el historial.',
  HISTORY_ARIA: 'Historial de promedios de docentes por gestión',
  HISTORY_NOTE: 'Cada punto representa el promedio de las calificaciones registradas en esa gestión.',
  RETRY: 'Reintentar',

  EMPTY_TITLE: 'No hay docentes registrados',
  EMPTY_DESCRIPTION: 'Actualmente esta materia no tiene docentes disponibles.',

  PENDING_STATUS: 'Pendiente de evaluación',
  REGISTERED_STATUS: 'Evaluación registrada',
  UNAVAILABLE_STATUS: 'Estado de evaluación no disponible',

  RATE_BUTTON: 'Calificar docente',
  VIEW_BUTTON: 'Ver evaluación',

  MODAL_TITLE: 'Calificar docente',
  MODAL_DESCRIPTION: 'Evalúa tu experiencia con este docente.',

  DETAIL_TITLE: 'Evaluación del docente',
  DETAIL_DESCRIPTION: 'Estos son los valores que registraste para este docente.',

  EDIT_BUTTON: 'Editar evaluación',
  DELETE_BUTTON: 'Eliminar',
  CLOSE_BUTTON: 'Cerrar',

  EDIT_TITLE: 'Editar evaluación',
  EDIT_DESCRIPTION: 'Actualiza los valores de tu evaluación.',

  CLARITY_LABEL: 'Claridad de explicaciones',
  METHODOLOGY_LABEL: 'Metodología',
  RELATION_LABEL: 'Relación clases/evaluaciones',

  PERIOD_LABEL: 'Periodo',
  CURRENT_PERIOD_LABEL: 'Periodo actual',

  CANCEL_BUTTON: 'Cancelar',
  CONTINUE_BUTTON: 'Continuar',

  CONFIRM_TITLE: 'Confirmar evaluación',
  CONFIRM_DESCRIPTION: 'Revisa los valores antes de registrar tu evaluación.',

  UPDATE_CONFIRM_TITLE: 'Confirmar cambios',
  UPDATE_CONFIRM_DESCRIPTION: 'Revisa los valores antes de actualizar tu evaluación.',

  BACK_BUTTON: 'Volver',
  CONFIRM_BUTTON: 'Confirmar evaluación',
  SAVE_BUTTON: 'Guardar cambios',

  SENDING: 'Registrando...',
  UPDATING: 'Actualizando...',

  SUCCESS: 'Evaluación registrada correctamente.',
  UPDATE_SUCCESS: 'Evaluación actualizada correctamente.',

  REGISTER_ERROR: 'No se pudo registrar la evaluación. Intenta nuevamente.',
  UPDATE_ERROR: 'No se pudo actualizar la evaluación. Intenta nuevamente.',
  DUPLICATE_ERROR: 'Ya calificaste a este docente.',

  DELETE_CONFIRM_TITLE: 'Eliminar evaluación',
  DELETE_CONFIRM_DESCRIPTION:
    '¿Seguro que deseas eliminar esta evaluación? Esta acción no se puede deshacer.',
  DELETE_CONFIRM_BUTTON: 'Eliminar evaluación',
  DELETING: 'Eliminando...',
  DELETE_SUCCESS: 'Evaluación eliminada correctamente.',
  DELETE_ERROR: 'No se pudo eliminar la evaluación. Intenta nuevamente.'
} as const;
