/**

* Textos de la pantalla de login.
* Todos los textos visibles viven aquí para poder reutilizarlos.
  */
  export const LOGIN_MESSAGES = {
    // Panel izquierdo
    BRAND_NAME: 'UniHub',
    BRAND_SUBTITLE: 'BIBLIOTECA ACADÉMICA',

    HERO_EYEBROW: 'TU ESPACIO UNIVERSITARIO',
    HERO_TITLE: 'Todo tu semestre, en un mismo lugar.',
    HERO_DESCRIPTION:
    'Organiza tus materias, consulta material académico y construye horarios sin cruces.',

    FEATURE_MATERIAL: 'Material y evaluaciones por materia',
    FEATURE_PROFILE: 'Perfil académico personalizado',
    FOOTER_COMMUNITY: 'Comunidad académica UniHub',

    // Panel derecho
    FORM_EYEBROW: 'ACCESO ESTUDIANTIL',
    FORM_TITLE: 'Bienvenido a UniHub',
    FORM_SUBTITLE: 'Ingresa a tu cuenta para continuar.',

    REGISTER_TAB: 'Registrarse',
    LOGIN_TAB: 'Iniciar sesión',
    SHOW_PASSWORD: 'Mostrar contraseña',
    HIDE_PASSWORD: 'Ocultar contraseña',

    // Login
    GOOGLE_BUTTON: 'Continuar con Google',
    SEPARATOR: 'o usa tu correo universitario',

    EMAIL_LABEL: 'Correo',
    EMAIL_PLACEHOLDER: 'nombre.primerapellido@ucb.edu.bo',

    PASSWORD_LABEL: 'Contraseña',
    PASSWORD_PLACEHOLDER: 'Tu contraseña',

    FORGOT_PASSWORD: '¿Olvidaste tu contraseña?',

    LOGIN_BUTTON: 'Iniciar sesión',
    ERROR_EMAIL_REQUIRED: 'El correo electrónico es obligatorio',
    ERROR_EMAIL_INVALID: 'Ingresa un correo electrónico válido',
    ERROR_PASSWORD_REQUIRED: 'La contraseña es obligatoria',
    ERROR_INVALID_CREDENTIALS: 'El correo electrónico o la contraseña son incorrectos',
    ERROR_VALIDATION_SERVER: 'Revisa los datos ingresados e inténtalo nuevamente',
    ERROR_CONNECTION: 'No se pudo conectar con el servidor',
    ERROR_TIMEOUT: 'La solicitud tardó demasiado. Inténtalo nuevamente',
} as const;
