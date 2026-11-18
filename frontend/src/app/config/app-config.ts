import { ENV } from '../../environments/environment';

/**
 * Configuración de la aplicación
 */
export const APP_CONFIG = {

  DEMO_MODE: true,

  DEMO: {
    STUDENT_ID: 2,
  },

  API: {
    // BACKEND_URL del .env (backend remoto) + /api.
    BASE_URL: `${ENV.BACKEND_URL}/api`,

    ENDPOINTS: {
      MATERIAS: '/materias',
      CARRERAS: '/materias/carreras',
      CALIFICACION_MATERIA: '/calificacion-materia',
      CALIFICACION_MATERIA_PROMEDIOS: '/calificacion-materia/promedios/materias',
      HORARIOS: '/horarios',
      HORARIOS_OBTENER_DATOS: '/horarios/obtenerDatos',
      HORARIOS_GENERAR: '/horarios/generarhorarios',
      DOCENTES: '/docentes',
      MATERIALES: '/material',
      CALIFICACION_DOCENTE: '/calificacion-docente',
      TEST: '/test',
      DATABASE_HEALTH: '/health/database',
      AUTH_REGISTER: '/estudiantes',
      AUTH_LOGIN: '/estudiantes/login',
      AUTH_RECUPERAR_CONTRASENA: '/estudiantes/recuperar-contrasena',
      AYUDANTE_MATERIA: '/ayudante-materia',
      SOLICITUD_AYUDANTE: '/solicitud-ayudante',
      SOLICITUD_AYUDA: '/solicitud-ayuda',
      NOTIFICACIONES: '/notificaciones',
      ACTIVIDAD_ESTUDIANTE: '/actividad-estudiante',
    },
  },

  ROUTES: {
    REGISTRO: '/registro',
    // Pantallas a pantalla completa: se oculta el sidebar y el navbar.
    SIN_LAYOUT: ['/', '/registro', '/login', '/recuperar-contrasena'],
  },

  AUTH: {
    NOMBRE_MIN_LENGTH: 3,
    CONTRASENA_MIN_LENGTH: 8,
  },

  TIMEOUTS: {
    NOTIFICATIONS_POLLING_MS: 30000,
    API_REQUEST: 15000, // 15 segundos
    SEARCH_DEBOUNCE: 300,
  },

  COMPONENT_STATES: {
    LOADING: 'cargando',
    READY: 'listo',
    ERROR: 'error',
  } as const,

  SCALE: {
    RATING_TOTAL: 10,
  },

  SEMESTER_LEVELS: {
    BASIC_END: 1,
    INTERMEDIATE_START: 2,
    INTERMEDIATE_END: 4,
    ADVANCED_START: 5,
  },

  PAGINATION: {
    PAGE_SIZE: 12,
  },

} as const;
