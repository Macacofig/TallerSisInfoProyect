import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, TimeoutError, catchError, timeout, throwError } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import { ErrorAuth, RegistroRequest, RegistroResponse } from '../models/registrar';
import { LoginRequest, LoginResponse } from '../models/login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly urlRegistro =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.AUTH_REGISTER}`;  

  private readonly urlLogin =
  `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.AUTH_LOGIN}`;

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

  loginUser(datos: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.urlLogin, datos, {
        headers: { 'Content-Type': 'application/json' }
      })
      .pipe(
        timeout(APP_CONFIG.TIMEOUTS.API_REQUEST),
        catchError((error: unknown) =>
          throwError(() => mapearErrorHttp(error))
        )
      );
  }
}

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

function extraerErroresPorCampo(cuerpo: unknown): Record<string, string> | undefined {
  const errores = (cuerpo as { errores?: unknown } | null)?.errores;
  if (!errores || typeof errores !== 'object') return undefined;

  const campos = Object.fromEntries(
    Object.entries(errores).filter(([, mensaje]) => typeof mensaje === 'string')
  ) as Record<string, string>;

  return Object.keys(campos).length > 0 ? campos : undefined;
}
