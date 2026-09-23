export const DOCENTES_MESSAGES = {
  TITLE: 'Docentes',
  DESCRIPTION: 'Consulta y evalúa a los docentes registrados para esta materia.',

  LOADING: 'Cargando docentes...',
  LOAD_ERROR: 'No se pudieron cargar los docentes de esta materia.',
  STATUS_ERROR: 'No se pudo verificar el estado de las evaluaciones.',
  RETRY: 'Reintentar',

  EMPTY_TITLE: 'No hay docentes registrados',
  EMPTY_DESCRIPTION: 'Actualmente esta materia no tiene docentes disponibles.',

  PENDING_STATUS: 'Pendiente de evaluación',
  REGISTERED_STATUS: 'Evaluación registrada',

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
