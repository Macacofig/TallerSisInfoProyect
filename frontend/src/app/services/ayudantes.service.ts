import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import {
  AyudanteMateriaResponse,
  EstudianteTelefonoResponse,
  SolicitudAyudaRequest,
  SolicitudAyudaResponse,
  SolicitudAyudanteRequest,
  SolicitudAyudanteResponse
} from '../models/ayudante-materia.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AyudantesService {
  private readonly ayudanteMateriaUrl =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.AYUDANTE_MATERIA}`;
  private readonly solicitudAyudaUrl =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.SOLICITUD_AYUDA}`;
  private readonly solicitudAyudanteUrl =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.SOLICITUD_AYUDANTE}`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  obtenerAprobadosPorMateria(
    idMateria: number
  ): Observable<AyudanteMateriaResponse[]> {
    return this.http.get<AyudanteMateriaResponse[]>(
      `${this.ayudanteMateriaUrl}/materia/${idMateria}/aprobados`
    );
  }

  obtenerTelefonoEstudiante(
    idEstudiante: number
  ): Observable<EstudianteTelefonoResponse> {
    return this.http.get<EstudianteTelefonoResponse>(
      `${APP_CONFIG.API.BASE_URL}/estudiantes/${idEstudiante}/telefono`
    );
  }

  solicitarAyuda(
    solicitud: SolicitudAyudaRequest
  ): Observable<SolicitudAyudaResponse> {
    return this.http.post<SolicitudAyudaResponse>(
      this.solicitudAyudaUrl,
      solicitud,
      { headers: this.authService.obtenerHeadersAutenticacion() }
    );
  }

  solicitarSerAyudante(
    solicitud: SolicitudAyudanteRequest
  ): Observable<SolicitudAyudanteResponse> {
    return this.http.post<SolicitudAyudanteResponse>(
      this.solicitudAyudanteUrl,
      solicitud,
      { headers: this.authService.obtenerHeadersAutenticacion() }
    );
  }
}
