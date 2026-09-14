import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CalificacionMateriaPromedioResponse,
  CalificacionMateriaResponse,
  RegistrarCalificacionMateriaRequest
} from '../models/calificacion-materia.model';

import { APP_CONFIG } from '../strings/app-config';

@Injectable({
  providedIn: 'root'
})
export class CalificacionesMateriaService {

  private readonly apiUrl =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.CALIFICACION_MATERIA}`;

  constructor(
    private readonly http: HttpClient
  ) {}

  registrarCalificacion(
    calificacion: RegistrarCalificacionMateriaRequest
  ): Observable<CalificacionMateriaResponse> {

    return this.http.post<CalificacionMateriaResponse>(
      this.apiUrl,
      calificacion
    );
  }

  obtenerCalificacionPorEstudiante(
    idEstudiante: number,
    idMateria: number
  ): Observable<CalificacionMateriaResponse | null> {

    const url =
      `${this.apiUrl}/estudiante/${idEstudiante}/materia/${idMateria}`;

    return this.http.get<CalificacionMateriaResponse | null>(
      url
    );
  }

  obtenerPromediosPorMateria(
    idMateria: number
  ): Observable<CalificacionMateriaPromedioResponse> {

    const url =
      `${this.apiUrl}/materia/${idMateria}`;

    return this.http.get<CalificacionMateriaPromedioResponse>(
      url
    );
  }

  obtenerGestiones(): Observable<string[]> {

    const url =
      `${this.apiUrl}/gestiones`;

    return this.http.get<string[]>(
      url
    );
  }

  obtenerPromediosPorGestion(
    gestion: string
  ): Observable<CalificacionMateriaPromedioResponse> {

    const url =
      `${this.apiUrl}/periodo/${encodeURIComponent(gestion)}`;

    return this.http.get<CalificacionMateriaPromedioResponse>(
      url
    );
  }

  obtenerPromediosPorRango(
    gestionDesde: string,
    gestionHasta: string
  ): Observable<CalificacionMateriaPromedioResponse> {

    const desde =
      encodeURIComponent(gestionDesde);

    const hasta =
      encodeURIComponent(gestionHasta);

    const url =
      `${this.apiUrl}/periodo/rango?desde=${desde}&hasta=${hasta}`;

    return this.http.get<CalificacionMateriaPromedioResponse>(
      url
    );
  }
}