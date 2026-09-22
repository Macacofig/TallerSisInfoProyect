import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';

import {
  CalificacionDocenteResponse,
  RegistrarCalificacionDocenteRequest
} from '../models/calificacion-docente.model';

@Injectable({
  providedIn: 'root'
})
export class CalificacionesDocenteService {

  private readonly apiUrl =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.CALIFICACION_DOCENTE}`;

  constructor(
    private readonly http: HttpClient
  ) {}

  registrarCalificacion(
    calificacion: RegistrarCalificacionDocenteRequest
  ): Observable<CalificacionDocenteResponse> {

    return this.http.post<CalificacionDocenteResponse>(
      this.apiUrl,
      calificacion
    );
  }

  obtenerPorEstudiante(
    idEstudiante: number,
    idDocente: number
  ): Observable<CalificacionDocenteResponse | null> {

    const url =
      `${this.apiUrl}/estudiante/${idEstudiante}/docente/${idDocente}`;

    return this.http.get<CalificacionDocenteResponse | null>(
      url
    );
  }

  actualizarCalificacion(
    idEstudiante: number,
    idDocente: number,
    calificacion: RegistrarCalificacionDocenteRequest
  ): Observable<CalificacionDocenteResponse> {

    const url =
      `${this.apiUrl}/estudiante/${idEstudiante}/docente/${idDocente}`;

    return this.http.put<CalificacionDocenteResponse>(
      url,
      calificacion
    );
  }

  eliminarCalificacion(
    idEstudiante: number,
    idDocente: number
  ): Observable<void> {

    const url =
      `${this.apiUrl}/estudiante/${idEstudiante}/docente/${idDocente}`;

    return this.http.delete<void>(
      url
    );
  }
}
