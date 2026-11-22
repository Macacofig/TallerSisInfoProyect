export const MATERIAL_PENDIENTE_MESSAGES = {
  COUNT_SINGULAR: '{count} documento esperando revisión',
  COUNT_PLURAL: '{count} documentos esperando revisión',
  TABLE_LABEL: 'Documentos pendientes de revisión',
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
    DELETE: 'Eliminar'
  },
  EMPTY: 'No hay documentos pendientes por revisar.'
} as const;
