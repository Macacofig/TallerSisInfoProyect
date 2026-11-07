import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { timeout } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { NotificacionesCount, NotificacionesPage } from '../models/notificacion.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.NOTIFICACIONES}`;

  obtenerNotificaciones(page = 0, size = 20) {
    return this.http.get<NotificacionesPage>(this.url, {
      params: { page, size }, headers: this.auth.obtenerHeadersAutenticacion()
    }).pipe(timeout(APP_CONFIG.TIMEOUTS.API_REQUEST));
  }

  obtenerCantidadNoLeidas() {
    return this.http.get<NotificacionesCount>(`${this.url}/no-leidas/count`, {
      headers: this.auth.obtenerHeadersAutenticacion()
    }).pipe(timeout(APP_CONFIG.TIMEOUTS.API_REQUEST));
  }

  marcarComoLeida(id: number) {
    return this.http.post<void>(`${this.url}/${id}/leer`, null, {
      headers: this.auth.obtenerHeadersAutenticacion()
    }).pipe(timeout(APP_CONFIG.TIMEOUTS.API_REQUEST));
  }

  marcarTodasComoLeidas() {
    return this.http.post<void>(`${this.url}/leer-todas`, null, {
      headers: this.auth.obtenerHeadersAutenticacion()
    }).pipe(timeout(APP_CONFIG.TIMEOUTS.API_REQUEST));
  }
}
