/**
 * Modelos de autenticación (registro e inicio de sesión).
 */

export interface RegistroRequest {
  nombre: string;
  contrasena: string;
  telefono: string;
  carrera: string;
  correoElectronico: string;
}

export interface RegistroResponse {
  id: number;
  nombre: string;
  telefono: string;
  correoElectronico: string;
  carrera: string;
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
