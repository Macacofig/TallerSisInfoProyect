import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
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
}