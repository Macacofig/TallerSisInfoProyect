export const MATERIAL_PENDIENTE_MESSAGES_EN = {
  COUNT_SINGULAR: '{count} document awaiting review',
  COUNT_PLURAL: '{count} documents awaiting review',
  TABLE_LABEL: 'Documents pending review',
  COLUMNS: {
    ARCHIVO: 'File',
    MATERIA: 'Subject',
    DOCENTE: 'Instructor',
    SEMESTRE: 'Semester',
    USUARIO: 'User',
    TIPO: 'Type',
    FECHA: 'Date',
    ACCIONES: 'Actions'
  },
  ACTIONS: {
    VIEW: 'View',
    APPROVE: 'Approve',
    REJECT: 'Reject',
    DELETE: 'Delete'
  },
  EMPTY: 'There are no documents waiting for review.'
} as const;
