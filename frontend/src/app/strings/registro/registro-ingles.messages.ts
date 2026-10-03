/**
 * Textos de la pantalla de registro (page/registro).
 * Todos los textos visibles viven aquí para poder reutilizarlos.
 */
export const REGISTRO_MESSAGES = {

  // Panel izquierdo (marca)
  BRAND_NAME: 'UniHub',
  BRAND_SUBTITLE: 'ACADEMIC LIBRARY',
  HERO_EYEBROW: 'YOUR UNIVERSITY SPACE',
  HERO_TITLE: 'Your entire semester, all in one place.',
  HERO_DESCRIPTION:
    'Organize your courses, access academic materials, and build schedules without conflicts.',
  FEATURE_MATERIAL: 'Course materials and assessments',
  FEATURE_PROFILE: 'Personalized academic profile',
  FOOTER_COMMUNITY: 'UniHub academic community',

  // Panel derecho (encabezado)
  FORM_EYEBROW: 'STUDENT ACCESS',
  FORM_TITLE: 'Welcome to UniHub',
  FORM_SUBTITLE: 'Sign in to your account or create your university profile.',

  REGISTER_TAB: 'Sign up',
  LOGIN_TAB: 'Sign in',

  // Selector de pestañas
  TABS_ARIA_LABEL: 'Choose between signing in or creating an account',
  TAB_LOGIN: 'Sign in',
  TAB_REGISTER: 'Create account',
  LOGIN_PENDING_TITLE: 'Sign-in will be available soon',
  LOGIN_PENDING_DESCRIPTION:
    'For now, you can create your account from the «Create account» tab.',

  // Campos del formulario
  FIELD_NAME_LABEL: 'Full name',
  FIELD_NAME_PLACEHOLDER: 'Your full name',
  FIELD_CAREER_LABEL: 'Program',
  FIELD_CAREER_PLACEHOLDER: 'E.g. Computer Science',
  FIELD_EMAIL_LABEL: 'Email',
  FIELD_EMAIL_PLACEHOLDER: 'first.last@ucb.edu.bo',
  FIELD_PHONE_LABEL: 'Phone',
  FIELD_PHONE_PLACEHOLDER: 'E.g. 71234567',
  FIELD_PASSWORD_LABEL: 'Password',
  FIELD_PASSWORD_PLACEHOLDER: 'Minimum 8 characters',

  // Botón y nota
  SUBMIT_BUTTON: 'Create my account',
  SUBMIT_BUTTON_LOADING: 'Creating account...',

  // Errores de validación (debajo de cada campo)
  ERROR_NAME_REQUIRED: 'Enter your full name.',
  ERROR_NAME_MIN_LENGTH: 'The name must contain at least 3 characters.',
  ERROR_CAREER_REQUIRED: 'Enter your program.',
  ERROR_EMAIL_REQUIRED: 'Enter your email.',
  ERROR_EMAIL_INVALID: 'Enter a valid email, for example name@ucb.edu.bo.',
  ERROR_EMAIL_UCB: 'The email must belong to the @ucb.edu.bo domain.',
  ERROR_PHONE_INVALID: 'The phone number must start with 6 or 7 and contain 8 digits.',
  ERROR_PASSWORD_REQUIRED: 'Enter a password.',
  ERROR_PASSWORD_MIN_LENGTH: 'The password must contain at least 8 characters.',
  ERROR_PASSWORD_UPPERCASE: 'The password must contain at least one uppercase letter.',
  ERROR_PASSWORD_NUMBER: 'The password must contain at least one number.',
  ERROR_PASSWORD_SPECIAL: 'The password must contain at least one special character.',

  // Errores generales (encima del botón)
  ERROR_EMAIL_TAKEN: 'This email is already registered.',
  ERROR_VALIDATION_SERVER: 'Check the entered information and try again.',
  ERROR_CONNECTION: 'Could not connect to the server. Check your connection and try again.',
  ERROR_TIMEOUT: 'The server took too long to respond. Please try again.',
  ERROR_SERVER: 'A server error occurred. Please try again later.',

  // Modal de confirmación
  MODAL_TITLE: 'Account created!',
  MODAL_DESCRIPTION: 'We registered your account with the email',
  MODAL_HINT: 'Thank you for joining UniHub. We invite you to explore the platform and take advantage of all the resources we have for you.',
  MODAL_BUTTON: 'Got it',

} as const;