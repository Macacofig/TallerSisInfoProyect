/**
 * Modelos de autenticación (registro e inicio de sesión).
 */

/** Cuerpo de POST /api/auth/register (no incluye semestre). */
export interface RegistroRequest {
  nombre: string;
  carrera: string;
  correoElectronico: string;
  contrasena: string;
  // TODO (BACKEND): el formulario todavía no pide teléfono, por eso viaja null.
  // Confirmar con backend si es obligatorio; si lo es, agregar el campo al formulario.
  telefono: string | null;
}

/** Respuesta esperada de POST /api/auth/register (201). Ajustar al contrato real. */
export interface RegistroResponse {
  id: number;
  nombre: string;
  correoElectronico: string;
}

/** Códigos de error que entiende la UI (los textos viven en /strings). */
export type CodigoErrorAuth =
  | 'VALIDACION'        // 400: el servidor rechazó algún dato
  | 'CORREO_DUPLICADO'  // 409: el correo ya existe
  | 'SERVIDOR'          // 500 u otro estado inesperado
  | 'SIN_CONEXION'      // sin red / backend apagado (status 0)
  | 'TIEMPO_AGOTADO';   // se superó APP_CONFIG.TIMEOUTS.API_REQUEST

export interface ErrorAuth {
  codigo: CodigoErrorAuth;
  estado: number;
  /** Errores por campo devueltos por el servidor (solo en 400), si vienen. */
  campos?: Record<string, string>;
}

// TODO (BACKEND): descomentar junto con loginUser() en auth.service.ts
// export interface LoginRequest {
//   correoElectronico: string;
//   contrasena: string;
// }
//
// export interface LoginResponse {
//   token: string;          // o el mecanismo de sesión que defina el backend
//   nombre: string;
// }
