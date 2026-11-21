export const SOLICITUDES_AYUDANTE_MESSAGES = {
  LOADING: 'Cargando postulaciones...',
  EMPTY: 'No hay postulaciones pendientes.',
  LOAD_ERROR: 'No se pudieron cargar las postulaciones.',
  UNAUTHORIZED: 'Tu sesión no está autorizada para consultar esta información.',
  FORBIDDEN: 'No tienes permiso para gestionar postulaciones.',
  APPROVE: 'Aprobar',
  REJECT: 'Rechazar',
  CONFIRM_APPROVE: '¿Confirmas que quieres aprobar esta postulación?',
  CONFIRM_REJECT: '¿Confirmas que quieres rechazar esta postulación?',
  APPROVED: 'Postulación aprobada.',
  REJECTED: 'Postulación rechazada.',
  ACTION_ERROR: 'No se pudo actualizar la postulación.',
  MOTIVATION: 'Motivación',
  GRADE: 'Nota obtenida',
  SCHEDULES: 'Horarios',
  BUSY: 'Actualizando...',
  RETRY: 'Reintentar',
  ESTADOS: {
    PENDIENTE: 'Pendiente',
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada'
  }
} as const;
