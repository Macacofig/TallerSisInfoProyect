/**
 * Textos del navbar en inglés.
 */
export const NAVBAR_MESSAGES_EN = {
  NOTIFICATIONS_TITLE: 'Notifications',
  NOTIFICATIONS_READ_ALL: 'Mark all as read',
  NOTIFICATIONS_EMPTY: 'You have no notifications',
  NOTIFICATIONS_ERROR: 'Failed to load notifications',
  NOTIFICATIONS_READ_ERROR: 'Could not save read status. Please retry.',
  NOTIFICATIONS_RETRY: 'Retry',
  NOTIFICATIONS_LOADING: 'Loading notifications',
  NOTIFICATIONS_READ: 'Mark as read',
  NOTIFICATIONS_MORE: 'Load more',
  NOTIFICATIONS_UNREAD: 'Unread',
  NOTIFICATIONS_TYPES: {
    POSTULACION_CREADA: { titulo: 'Application registered', mensaje: 'Your teaching assistant application was registered.' },
    POSTULACION_APROBADA: { titulo: 'Application approved', mensaje: 'Your teaching assistant application was approved.' },
    POSTULACION_RECHAZADA: { titulo: 'Application rejected', mensaje: 'Your teaching assistant application was rejected.' },
    SOLICITUD_AYUDA_RECIBIDA: { titulo: 'New help request', mensaje: 'You received a new help request.' },
  },
  NOTIFICATIONS_ARIA_LABEL: 'Notifications',
  TOGGLE_LANGUAGE_LABEL: 'Change language',
  PROFILE_MENU: 'Profile',
  LOGOUT_MENU: 'Log out',
} as const;
