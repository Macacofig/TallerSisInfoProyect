import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import { AuthService } from './auth.service';

import {
  CalificacionDocentePromedioResponse,
  CalificacionDocenteResponse,
  GestionDocente,
  RegistrarCalificacionDocenteRequest
} from '../models/calificacion-docente.model';

@Injectable({
  providedIn: 'root'
})
export class CalificacionesDocenteService {

  private readonly apiUrl =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.CALIFICACION_DOCENTE}`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  obtenerPromediosPorMateria(
    idMateria: number
  ): Observable<CalificacionDocentePromedioResponse[]> {

    const url =
      `${this.apiUrl}/materia/${idMateria}/docentes`;

    return this.http.get<CalificacionDocentePromedioResponse[]>(
      url
    );
  }

  obtenerGestionesPorMateria(
    idMateria: number
  ): Observable<GestionDocente[]> {

    return this.http.get<GestionDocente[]>(
      `${this.apiUrl}/materia/${idMateria}/gestiones`
    );
  }

  obtenerPromediosPorGestion(
    idMateria: number,
    gestion: GestionDocente
  ): Observable<CalificacionDocentePromedioResponse[]> {

    return this.http.get<CalificacionDocentePromedioResponse[]>(
      `${this.apiUrl}/materia/${idMateria}/periodo/${encodeURIComponent(gestion)}`
    );
  }

  obtenerPromediosPorRango(
    idMateria: number,
    desde: GestionDocente,
    hasta: GestionDocente
  ): Observable<CalificacionDocentePromedioResponse[]> {

    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<CalificacionDocentePromedioResponse[]>(
      `${this.apiUrl}/materia/${idMateria}/periodo/rango`,
      { params }
    );
  }

  registrarCalificacion(
    calificacion: RegistrarCalificacionDocenteRequest
  ): Observable<CalificacionDocenteResponse> {

    return this.http.post<CalificacionDocenteResponse>(
      this.apiUrl,
      calificacion,
      { headers: this.authService.obtenerHeadersAutenticacion() }
    );
  }

  obtenerPorEstudiante(
  idEstudiante: number,
  idDocente: number,
  idMateria: number
  ): Observable<CalificacionDocenteResponse | null> {

    const url =
      `${this.apiUrl}/estudiante/${idEstudiante}/docente/${idDocente}/materia/${idMateria}`;

    return this.http.get<CalificacionDocenteResponse | null>(
      url,
      { headers: this.authService.obtenerHeadersAutenticacion() }
    );
  }

  actualizarCalificacion(
  idEstudiante: number,
  idDocente: number,
  idMateria: number,
  calificacion: RegistrarCalificacionDocenteRequest
  ): Observable<CalificacionDocenteResponse> {

    const url =
      `${this.apiUrl}/estudiante/${idEstudiante}/docente/${idDocente}/materia/${idMateria}`;

    return this.http.put<CalificacionDocenteResponse>(
      url,
      calificacion,
      { headers: this.authService.obtenerHeadersAutenticacion() }
    );
  }

  eliminarCalificacion(
  idEstudiante: number,
  idDocente: number,
  idMateria: number
  ): Observable<void> {

    const url =
      `${this.apiUrl}/estudiante/${idEstudiante}/docente/${idDocente}/materia/${idMateria}`;

    return this.http.delete<void>(
      url,
      { headers: this.authService.obtenerHeadersAutenticacion() }
    );
  }
}
