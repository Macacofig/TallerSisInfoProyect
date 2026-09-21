import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, TimeoutError, catchError, timeout, throwError } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import { ErrorAuth, RegistroRequest, RegistroResponse } from '../models/registrar';

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

  private readonly http = inject(HttpClient);

  private readonly urlRegistro =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.AUTH_REGISTER}`;  

  registerUser(datos: RegistroRequest): Observable<RegistroResponse> {
    return this.http
      .post<RegistroResponse>(this.urlRegistro, datos, {
        headers: { 'Content-Type': 'application/json' }
      })
      .pipe(
        timeout(APP_CONFIG.TIMEOUTS.API_REQUEST),
        catchError((error: unknown) =>
          throwError(() => mapearErrorHttp(error))
        )
      );
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
