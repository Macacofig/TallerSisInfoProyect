import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, TimeoutError, of, switchMap, throwError, timer } from 'rxjs';

import { ErrorAuth, RegistroRequest, RegistroResponse } from '../models/auth.model';

// =============================================================================
// GUÍA: CÓMO PASAR DEL MOCK AL BACKEND REAL (cuando exista /api/auth/register)
// =============================================================================
// 1. [A] Descomentar los imports marcados con "[A]" (líneas de más abajo).
// 2. [B] Descomentar las propiedades `http` y `urlRegistro` dentro de la clase.
// 3. En registerUser():
//      - BORRAR el bloque "MOCK TEMPORAL" completo (de INICIO a FIN).
//      - DESCOMENTAR el bloque "CONEXIÓN REAL AL BACKEND".
// 4. BORRAR las constantes del bloque "MOCK TEMPORAL" de arriba de la clase.
// 5. Login: repetir lo mismo con `urlLogin` y `loginUser()` (más abajo), y
//    descomentar LoginRequest / LoginResponse en models/auth.model.ts.
// 6. Activar el test de integración comentado en auth.service.spec.ts.
//
// URL base: NO se usa una variable de entorno nueva; el proyecto ya centraliza
// la URL en APP_CONFIG.API.BASE_URL (http://localhost:8081/api). Los endpoints
// AUTH_REGISTER y AUTH_LOGIN ya están definidos en APP_CONFIG.API.ENDPOINTS.
//
// SEGURIDAD: la contraseña NUNCA se guarda ni se imprime (console.log, etc.).
// Solo viaja en el body de la petición. En producción el BASE_URL debe ser HTTPS.
// =============================================================================

// [A] TODO (BACKEND): descomentar estos imports cuando el endpoint esté listo
// import { HttpClient } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { catchError, timeout } from 'rxjs';
// import { APP_CONFIG } from '../config/app-config';

// ===== MOCK TEMPORAL - ELIMINAR cuando el backend esté listo (INICIO) =====
/** Espera simulada del "servidor", en milisegundos. */
const MOCK_LATENCIA_MS = 1000;
/** Correos que el mock trata como "ya registrados" (simulan un 409). */
const MOCK_CORREOS_REGISTRADOS = ['test@ucb.edu.bo', 'test@universidad.edu'];
// ===== MOCK TEMPORAL (FIN) =====

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // [B] TODO (BACKEND): descomentar cuando el endpoint /api/auth/register esté listo
  // private readonly http = inject(HttpClient);
  // private readonly urlRegistro =
  //   `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.AUTH_REGISTER}`;
  // private readonly urlLogin =
  //   `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.AUTH_LOGIN}`;

  /**
   * Registra un usuario nuevo.
   * Errores: el Observable falla con un `ErrorAuth` (ver models/auth.model.ts).
   */
  registerUser(datos: RegistroRequest): Observable<RegistroResponse> {

    // ===== MOCK TEMPORAL - ELIMINAR cuando el backend esté listo (INICIO) =====
    return timer(MOCK_LATENCIA_MS).pipe(
      switchMap(() => {
        const correo = datos.correoElectronico.trim().toLowerCase();

        // Simula 409: correo ya registrado.
        if (MOCK_CORREOS_REGISTRADOS.includes(correo)) {
          const error: ErrorAuth = { codigo: 'CORREO_DUPLICADO', estado: 409 };
          return throwError(() => error);
        }

        // Simula 201: usuario creado.
        return of<RegistroResponse>({
          id: Date.now(),
          nombre: datos.nombre,
          correoElectronico: correo
        });
      })
    );
    // ===== MOCK TEMPORAL (FIN) =====

    // ===== CONEXIÓN REAL AL BACKEND =====
    // TODO (BACKEND): descomentar cuando el endpoint /api/auth/register esté listo
    //
    // Respuestas esperadas:
    //   201 → éxito (el Observable emite RegistroResponse)
    //   400 → errores de validación del servidor  → ErrorAuth 'VALIDACION'
    //   409 → correo ya registrado                → ErrorAuth 'CORREO_DUPLICADO'
    //   500 / sin red / timeout                   → ErrorAuth genérico
    // (la traducción la hace mapearErrorHttp, al final de este archivo)
    //
    // return this.http
    //   .post<RegistroResponse>(this.urlRegistro, datos, {
    //     headers: { 'Content-Type': 'application/json' }
    //   })
    //   .pipe(
    //     // Timeout: si el servidor no responde a tiempo, falla con TimeoutError.
    //     timeout(APP_CONFIG.TIMEOUTS.API_REQUEST),
    //     // Equivale al try/catch de una petición con Promesas: cualquier fallo
    //     // (HTTP, red o timeout) se convierte en un ErrorAuth entendible por la UI.
    //     catchError((error: unknown) => throwError(() => mapearErrorHttp(error)))
    //   );
  }

  // ---------------------------------------------------------------------------
  // LOGIN — solo estructura (todavía no se usa en la UI)
  // ---------------------------------------------------------------------------
  // TODO (BACKEND): descomentar junto con LoginRequest/LoginResponse en
  // models/auth.model.ts (import { LoginRequest, LoginResponse } arriba)
  //
  // loginUser(datos: LoginRequest): Observable<LoginResponse> {
  //   return this.http
  //     .post<LoginResponse>(this.urlLogin, datos, {
  //       headers: { 'Content-Type': 'application/json' }
  //     })
  //     .pipe(
  //       timeout(APP_CONFIG.TIMEOUTS.API_REQUEST),
  //       catchError((error: unknown) => throwError(() => mapearErrorHttp(error)))
  //     );
  //   // Pendiente: 401 → credenciales inválidas (agregar un código nuevo a
  //   // CodigoErrorAuth y un caso en mapearErrorHttp).
  // }
}

/**
 * Traduce un error de HttpClient/RxJS a un ErrorAuth.
 * Está activa (y probada) aunque el mock no la use, para que al conectar el
 * backend solo haya que descomentar la petición.
 */
export function mapearErrorHttp(error: unknown): ErrorAuth {
  if (error instanceof TimeoutError) {
    return { codigo: 'TIEMPO_AGOTADO', estado: 0 };
  }

  if (error instanceof HttpErrorResponse) {
    switch (error.status) {
      case 0:
        return { codigo: 'SIN_CONEXION', estado: 0 };
      case 400:
        return { codigo: 'VALIDACION', estado: 400, campos: extraerErroresPorCampo(error.error) };
      case 409:
        return { codigo: 'CORREO_DUPLICADO', estado: 409 };
      default:
        return { codigo: 'SERVIDOR', estado: error.status };
    }
  }

  return { codigo: 'SERVIDOR', estado: 0 };
}

/**
 * Lee errores por campo del cuerpo de un 400.
 * TODO (BACKEND): ajustar al formato real. Se asume { "errores": { "campo": "mensaje" } }.
 */
function extraerErroresPorCampo(cuerpo: unknown): Record<string, string> | undefined {
  const errores = (cuerpo as { errores?: unknown } | null)?.errores;
  if (!errores || typeof errores !== 'object') return undefined;

  const campos = Object.fromEntries(
    Object.entries(errores).filter(([, mensaje]) => typeof mensaje === 'string')
  ) as Record<string, string>;

  return Object.keys(campos).length > 0 ? campos : undefined;
}
