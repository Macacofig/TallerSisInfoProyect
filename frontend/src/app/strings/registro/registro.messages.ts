/**
 * Textos de la pantalla de registro (page/registro).
 * Todos los textos visibles viven aquí para poder reutilizarlos.
 */
export const REGISTRO_MESSAGES = {

  // Panel izquierdo (marca)
  BRAND_NAME: 'UniHub',
  BRAND_SUBTITLE: 'BIBLIOTECA ACADÉMICA',
  HERO_EYEBROW: 'TU ESPACIO UNIVERSITARIO',
  HERO_TITLE: 'Todo tu semestre, en un mismo lugar.',
  HERO_DESCRIPTION:
    'Organiza tus materias, consulta material académico y construye horarios sin cruces.',
  FEATURE_MATERIAL: 'Material y evaluaciones por materia',
  FEATURE_PROFILE: 'Perfil académico personalizado',
  FOOTER_COMMUNITY: 'Comunidad académica UniHub',

  // Panel derecho (encabezado)
  FORM_EYEBROW: 'ACCESO ESTUDIANTIL',
  FORM_TITLE: 'Bienvenido a UniHub',
  FORM_SUBTITLE: 'Ingresa a tu cuenta o crea tu perfil universitario.',

  // Selector de pestañas
  TABS_ARIA_LABEL: 'Elige entre iniciar sesión o crear cuenta',
  TAB_LOGIN: 'Iniciar sesión',
  TAB_REGISTER: 'Crear cuenta',
  LOGIN_PENDING_TITLE: 'El inicio de sesión estará disponible pronto',
  LOGIN_PENDING_DESCRIPTION:
    'Por ahora puedes crear tu cuenta desde la pestaña «Crear cuenta».',

  // Campos del formulario
  FIELD_NAME_LABEL: 'Nombre completo',
  FIELD_NAME_PLACEHOLDER: 'Tu nombre completo',
  FIELD_CAREER_LABEL: 'Carrera',
  FIELD_CAREER_PLACEHOLDER: 'Ej. Ingeniería de Sistemas',
  FIELD_EMAIL_LABEL: 'Correo',
  FIELD_EMAIL_PLACEHOLDER: 'nombre.primerapellido@ucb.edu.bo',
  FIELD_PASSWORD_LABEL: 'Contraseña',
  FIELD_PASSWORD_PLACEHOLDER: 'Mínimo 6 caracteres',

  // Botón y nota
  SUBMIT_BUTTON: 'Crear mi cuenta',
  SUBMIT_BUTTON_LOADING: 'Creando cuenta...',

  // Errores de validación (debajo de cada campo)
  ERROR_NAME_REQUIRED: 'Ingresa tu nombre completo.',
  ERROR_NAME_MIN_LENGTH: 'El nombre debe tener al menos 3 caracteres.',
  ERROR_CAREER_REQUIRED: 'Ingresa tu carrera.',
  ERROR_EMAIL_REQUIRED: 'Ingresa tu correo.',
  ERROR_EMAIL_INVALID: 'Ingresa un correo válido, por ejemplo nombre@ucb.edu.bo.',
  ERROR_PASSWORD_REQUIRED: 'Ingresa una contraseña.',
  ERROR_PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 8 caracteres.',

  // Errores generales (encima del botón)
  ERROR_EMAIL_TAKEN: 'Este correo ya está registrado.',
  ERROR_VALIDATION_SERVER: 'Revisa los datos ingresados e inténtalo nuevamente.',
  ERROR_CONNECTION: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.',
  ERROR_TIMEOUT: 'El servidor tardó demasiado en responder. Inténtalo nuevamente.',
  ERROR_SERVER: 'Ocurrió un error en el servidor. Inténtalo nuevamente más tarde.',

  // Modal de confirmación
  MODAL_TITLE: '¡Cuenta creada!',
  MODAL_DESCRIPTION: 'Enviamos un correo de confirmación a',
  MODAL_HINT: 'Revisa tu bandeja de entrada para activar tu cuenta.',
  MODAL_BUTTON: 'Entendido',
} as const;
