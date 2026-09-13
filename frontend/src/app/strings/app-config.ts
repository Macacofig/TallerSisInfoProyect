/**
 * Configuración de la aplicación
 */
export const APP_CONFIG = {

  // Desactivar antes de la entrega para mostrar solo resultados de la API.
  DEMO_MODE: true,

  DEMO: {
    STUDENT_ID: 2,
  },

  API: {
    BASE_URL: 'http://localhost:8081/api',

    ENDPOINTS: {
      MATERIAS: '/materias',
      CALIFICACION_MATERIA: '/calificacion-materia',
      TEST: '/test',
    },
  },

  TIMEOUTS: {
    API_REQUEST: 15000,
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

} as const;