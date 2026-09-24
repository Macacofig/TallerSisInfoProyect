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
  FIELD_PHONE_LABEL: 'Teléfono',
  FIELD_PHONE_PLACEHOLDER: 'Ej. 71234567',
  FIELD_PASSWORD_LABEL: 'Contraseña',
  FIELD_PASSWORD_PLACEHOLDER: 'Mínimo 8 caracteres',

  // Botón y nota
  SUBMIT_BUTTON: 'Crear mi cuenta',
  SUBMIT_BUTTON_LOADING: 'Creando cuenta...',

  // Errores de validación (debajo de cada campo)
  ERROR_NAME_REQUIRED: 'Ingresa tu nombre completo.',
  ERROR_NAME_MIN_LENGTH: 'El nombre debe tener al menos 3 caracteres.',
  ERROR_CAREER_REQUIRED: 'Ingresa tu carrera.',
  ERROR_EMAIL_REQUIRED: 'Ingresa tu correo.',
  ERROR_EMAIL_INVALID: 'Ingresa un correo válido, por ejemplo nombre@ucb.edu.bo.',
  ERROR_EMAIL_UCB: 'El correo debe pertenecer al dominio @ucb.edu.bo.',
  ERROR_PHONE_INVALID: 'El teléfono debe empezar por 6 o 7 y tener 8 dígitos.',
  ERROR_PASSWORD_REQUIRED: 'Ingresa una contraseña.',
  ERROR_PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 8 caracteres.',
  ERROR_PASSWORD_UPPERCASE: 'La contraseña debe tener al menos una letra mayúscula.',
  ERROR_PASSWORD_NUMBER: 'La contraseña debe tener al menos un número.',
  ERROR_PASSWORD_SPECIAL: 'La contraseña debe tener al menos un carácter especial.',

  // Errores generales (encima del botón)
  ERROR_EMAIL_TAKEN: 'Este correo ya está registrado.',
  ERROR_VALIDATION_SERVER: 'Revisa los datos ingresados e inténtalo nuevamente.',
  ERROR_CONNECTION: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.',
  ERROR_TIMEOUT: 'El servidor tardó demasiado en responder. Inténtalo nuevamente.',
  ERROR_SERVER: 'Ocurrió un error en el servidor. Inténtalo nuevamente más tarde.',

  // Modal de confirmación
  MODAL_TITLE: '¡Cuenta creada!',
  MODAL_DESCRIPTION: 'Registramos tu cuenta con el correo',
  MODAL_HINT: 'Gracias por ingresar a Unihub. Te invitamos a explorar la plataforma y aprovechar todos los recursos que tenemos para ti.',
  MODAL_BUTTON: 'Entendido',

} as const;