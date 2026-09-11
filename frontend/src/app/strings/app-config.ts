/**
 * Configuración de la aplicación
 */
export const APP_CONFIG = {
  // Desactivar antes de la entrega para mostrar solo resultados de la API.
  DEMO_MODE: true,

  // Configuración del API
  API: {
    BASE_URL: 'http://localhost:8081/api',
    ENDPOINTS: {
      MATERIAS: '/materias',
      TEST: '/test',
    },
  },

  // Timeouts
  TIMEOUTS: {
    API_REQUEST: 15000, // 15 segundos
  },

  // Estados de componente
  COMPONENT_STATES: {
    LOADING: 'cargando',
    READY: 'listo',
    ERROR: 'error',
  } as const,

  // Valores de escala
  SCALE: {
    RATING_TOTAL: 10,
  },

  // Rangos de semestre para niveles
  SEMESTER_LEVELS: {
    BASIC_END: 1,
    INTERMEDIATE_START: 2,
    INTERMEDIATE_END: 4,
    ADVANCED_START: 5,
  },
} as const;
