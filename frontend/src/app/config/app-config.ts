/**
 * Configuración de la aplicación
 */
export const APP_CONFIG = {

  DEMO_MODE: true,

  DEMO: {
    STUDENT_ID: 2,
  },

  API: {
    BASE_URL: 'http://localhost:8081/api',

    ENDPOINTS: {
      MATERIAS: '/materias',
      CARRERAS: '/materias/carreras',
      CALIFICACION_MATERIA: '/calificacion-materia',
      DOCENTES: '/docentes',
      CALIFICACION_DOCENTE: '/calificacion-docente',
      TEST: '/test',
      AUTH_REGISTER: '/estudiantes',
      AUTH_LOGIN: '/auth/login',
    },
  },

  ROUTES: {
    REGISTRO: '/registro',
    // Pantallas a pantalla completa: se oculta el sidebar y el navbar.
    SIN_LAYOUT: ['/', '/registro'],
  },

  AUTH: {
    NOMBRE_MIN_LENGTH: 3,
    CONTRASENA_MIN_LENGTH: 8,
  },

  TIMEOUTS: {
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
