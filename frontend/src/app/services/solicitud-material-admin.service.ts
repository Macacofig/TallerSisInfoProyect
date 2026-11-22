import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import { SolicitudMaterialResponse } from '../models/solicitud-material.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SolicitudMaterialAdminService {
  private readonly url =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.SOLICITUD_MATERIAL}`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  obtenerPendientes(): Observable<SolicitudMaterialResponse[]> {
    return this.http.get<SolicitudMaterialResponse[]>(`${this.url}/pendientes`, {
      headers: this.authService.obtenerHeadersAutenticacion()
    });
  }

  aprobar(idSolicitud: number): Observable<SolicitudMaterialResponse> {
    return this.http.post<SolicitudMaterialResponse>(
      `${this.url}/${idSolicitud}/aprobar`,
      null,
      { headers: this.authService.obtenerHeadersAutenticacion() }
    );
  }

  rechazar(idSolicitud: number): Observable<SolicitudMaterialResponse> {
    return this.http.post<SolicitudMaterialResponse>(
      `${this.url}/${idSolicitud}/rechazar`,
      null,
      { headers: this.authService.obtenerHeadersAutenticacion() }
    );
  }

  eliminar(idSolicitud: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idSolicitud}`, {
      headers: this.authService.obtenerHeadersAutenticacion()
    });
  }
}
