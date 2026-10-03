/**
 * English texts for the login screen.
 * All visible texts live here so they can be reused.
 */
export const LOGIN_MESSAGES_EN = {
  // Left panel
  BRAND_NAME: 'UniHub',
  BRAND_SUBTITLE: 'ACADEMIC LIBRARY',

  HERO_EYEBROW: 'YOUR UNIVERSITY SPACE',
  HERO_TITLE: 'Your entire semester, all in one place.',
  HERO_DESCRIPTION:
    'Organize your subjects, access academic materials, and build schedules without conflicts.',

  FEATURE_MATERIAL: 'Materials and assessments by subject',
  FEATURE_PROFILE: 'Personalized academic profile',
  FOOTER_COMMUNITY: 'UniHub Academic Community',

  // Right panel
  FORM_EYEBROW: 'STUDENT ACCESS',
  FORM_TITLE: 'Welcome to UniHub',
  FORM_SUBTITLE: 'Sign in to your account to continue.',

  REGISTER_TAB: 'Sign up',
  LOGIN_TAB: 'Sign in',
  SHOW_PASSWORD: 'Show password',
  HIDE_PASSWORD: 'Hide password',

  // Login
  EMAIL_LABEL: 'Email',
  EMAIL_PLACEHOLDER: 'nombre.primerapellido@ucb.edu.bo',

  PASSWORD_LABEL: 'Password',
  PASSWORD_PLACEHOLDER: 'Your password',

  FORGOT_PASSWORD: 'Forgot your password?',

  LOGIN_BUTTON: 'Sign in',
  ERROR_EMAIL_REQUIRED: 'Email is required',
  ERROR_EMAIL_INVALID: 'Enter a valid email address',
  ERROR_PASSWORD_REQUIRED: 'Password is required',
  ERROR_INVALID_CREDENTIALS: 'The email or password is incorrect',
  ERROR_VALIDATION_SERVER: 'Check the information entered and try again',
  ERROR_CONNECTION: 'Could not connect to the server',
  ERROR_TIMEOUT: 'The request took too long. Please try again',
} as const;