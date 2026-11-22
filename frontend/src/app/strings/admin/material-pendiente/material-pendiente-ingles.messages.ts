export const MATERIAL_PENDIENTE_MESSAGES_EN = {
  COUNT_SINGULAR: '{count} document awaiting review',
  COUNT_PLURAL: '{count} documents awaiting review',
  TABLE_LABEL: 'Documents pending review',
  LOADING: 'Loading pending documents…',
  LOAD_ERROR: 'Pending documents could not be loaded.',
  LOAD_ACCESS_ERROR: 'You do not have permission to view pending documents.',
  NOT_AVAILABLE: '—',
  COLUMNS: {
    ARCHIVO: 'File',
    MATERIA: 'Subject',
    DOCENTE: 'Instructor',
    USUARIO: 'User',
    TIPO: 'Type',
    ACCIONES: 'Actions'
  },
  ACTIONS: {
    VIEW: 'View',
    APPROVE: 'Approve',
    REJECT: 'Reject',
    DELETE: 'Delete',
    CLOSE_PREVIEW: 'Close preview'
  },
  CONFIRMATIONS: {
    APPROVE: 'Approve the document "{name}"?',
    REJECT: 'Reject the document "{name}"?',
    DELETE: 'Permanently delete the document "{name}"?'
  },
  FEEDBACK: {
    APPROVE_SUCCESS: 'Document approved.',
    APPROVE_ERROR: 'The document could not be approved.',
    REJECT_SUCCESS: 'Document rejected.',
    REJECT_ERROR: 'The document could not be rejected.',
    DELETE_SUCCESS: 'Document deleted.',
    DELETE_ERROR: 'The document could not be deleted.',
    VIEW_ERROR: 'The document could not be opened.',
    VIEW_UNAVAILABLE: 'Preview is not available for this file type.'
  },
  EMPTY: 'There are no documents waiting for review.'
} as const;
