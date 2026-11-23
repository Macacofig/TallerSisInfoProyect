import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, throwError, timeout } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { MaterialEstudiante } from '../models/material-estudiante.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MaterialEstudianteService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.MIS_MATERIALES}`;

  obtenerMisMateriales(): Observable<MaterialEstudiante[]> {
    return defer(() => {
      if (!this.auth.tieneSesionValida()) {
        return throwError(() => new HttpErrorResponse({
          status: 401,
          statusText: 'Unauthorized',
          error: 'Se requiere una sesión válida'
        }));
      }

      return this.http.get<MaterialEstudiante[]>(this.url, {
        headers: this.auth.obtenerHeadersAutenticacion()
      }).pipe(timeout(APP_CONFIG.TIMEOUTS.API_REQUEST));
    });
  }
}
