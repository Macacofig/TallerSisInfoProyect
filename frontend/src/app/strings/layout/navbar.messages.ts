/**
 * Textos del navbar.
 */
export const NAVBAR_MESSAGES = {
  NOTIFICATIONS_TITLE: 'Notificaciones',
  NOTIFICATIONS_READ_ALL: 'Marcar todas como leídas',
  NOTIFICATIONS_EMPTY: 'No tienes notificaciones',
  NOTIFICATIONS_ERROR: 'Error al cargar las notificaciones',
  NOTIFICATIONS_READ_ERROR: 'No se pudo guardar la lectura. Reintenta.',
  NOTIFICATIONS_RETRY: 'Reintentar',
  NOTIFICATIONS_LOADING: 'Cargando notificaciones',
  NOTIFICATIONS_READ: 'Marcar como leída',
  NOTIFICATIONS_MORE: 'Cargar más',
  NOTIFICATIONS_UNREAD: 'No leída',
  NOTIFICATIONS_TYPES: {
    POSTULACION_CREADA: { titulo: 'Postulación registrada', mensaje: 'Registramos tu postulación de ayudantía.' },
    POSTULACION_APROBADA: { titulo: 'Postulación aprobada', mensaje: 'Tu postulación de ayudantía fue aprobada.' },
    POSTULACION_RECHAZADA: { titulo: 'Postulación rechazada', mensaje: 'Tu postulación de ayudantía fue rechazada.' },
    SOLICITUD_AYUDA_RECIBIDA: { titulo: 'Nueva solicitud de ayuda', mensaje: 'Recibiste una nueva solicitud de ayuda.' },
  },
  NOTIFICATIONS_ARIA_LABEL: 'Notificaciones',
  TOGGLE_LANGUAGE_LABEL: 'Cambiar idioma',
  PROFILE_MENU: 'Perfil',
  LOGOUT_MENU: 'Cerrar sesión',
} as const;
