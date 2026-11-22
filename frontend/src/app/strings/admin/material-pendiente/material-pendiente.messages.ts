export const MATERIAL_PENDIENTE_MESSAGES = {
  COUNT_SINGULAR: '{count} documento esperando revisión',
  COUNT_PLURAL: '{count} documentos esperando revisión',
  TABLE_LABEL: 'Documentos pendientes de revisión',
  LOADING: 'Cargando documentos pendientes…',
  LOAD_ERROR: 'No se pudieron cargar los documentos pendientes.',
  LOAD_ACCESS_ERROR: 'No tienes permiso para consultar los documentos pendientes.',
  NOT_AVAILABLE: '—',
  COLUMNS: {
    ARCHIVO: 'Archivo',
    MATERIA: 'Materia',
    DOCENTE: 'Docente',
    SEMESTRE: 'Semestre',
    USUARIO: 'Usuario',
    TIPO: 'Tipo',
    FECHA: 'Fecha',
    ACCIONES: 'Acciones'
  },
  ACTIONS: {
    VIEW: 'Ver',
    APPROVE: 'Aprobar',
    REJECT: 'Rechazar',
    DELETE: 'Eliminar',
    CLOSE_PREVIEW: 'Cerrar vista previa'
  },
  CONFIRMATIONS: {
    APPROVE: '¿Aprobar el documento "{name}"?',
    REJECT: '¿Rechazar el documento "{name}"?',
    DELETE: '¿Eliminar definitivamente el documento "{name}"?'
  },
  FEEDBACK: {
    APPROVE_SUCCESS: 'Documento aprobado.',
    APPROVE_ERROR: 'No se pudo aprobar el documento.',
    REJECT_SUCCESS: 'Documento rechazado.',
    REJECT_ERROR: 'No se pudo rechazar el documento.',
    DELETE_SUCCESS: 'Documento eliminado.',
    DELETE_ERROR: 'No se pudo eliminar el documento.',
    VIEW_ERROR: 'No se pudo abrir el documento.',
    VIEW_UNAVAILABLE: 'La vista previa no está disponible para este tipo de archivo.'
  },
  EMPTY: 'No hay documentos pendientes por revisar.'
} as const;
