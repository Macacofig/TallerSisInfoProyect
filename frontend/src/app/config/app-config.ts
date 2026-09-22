/**
 * Configuración de la aplicación
 */
export const APP_CONFIG = {

  // Mostrar los resultados reales de la API por defecto.
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
    },
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
