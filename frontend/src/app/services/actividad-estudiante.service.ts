import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, throwError, timeout } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { ActividadEstudiante } from '../models/actividad-estudiante.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ActividadEstudianteService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.ACTIVIDAD_ESTUDIANTE}`;

  obtenerMiActividad(): Observable<ActividadEstudiante[]> {
    return defer(() => {
      const usuario = this.auth.obtenerUsuario();
      if (!usuario || !this.auth.tieneSesionValida()) {
        return throwError(() => new HttpErrorResponse({
          status: 401,
          statusText: 'Unauthorized',
          error: 'Se requiere una sesión válida'
        }));
      }

      return this.http.get<ActividadEstudiante[]>(`${this.url}/estudiante/${usuario.id}`, {
        headers: this.auth.obtenerHeadersAutenticacion()
      }).pipe(timeout(APP_CONFIG.TIMEOUTS.API_REQUEST));
    });
  }
}
