import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Materia } from '../models/materia';
import { CalificacionMateriaPromedioMateriaResponse } from '../models/calificacion-materia.model';
import { MaterialResponse } from '../models/material.model';
import { APP_CONFIG } from '../config/app-config';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = APP_CONFIG.API.BASE_URL;

  constructor(private http: HttpClient) {}

  obtenerMaterias(nombre = '', carrera = ''): Observable<Materia[]> {
    const termino = nombre.trim().replace(/\s+/g, ' ');
    let params = termino ? new HttpParams().set('nombre', termino) : new HttpParams();
    if (carrera.trim()) params = params.set('carrera', carrera.trim());
    return this.http.get<Materia[]>(`${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.MATERIAS}`, { params });
  }

  obtenerCarreras(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.CARRERAS}`);
  }

  obtenerMateriales(
    idMateria: number,
    filtros: { idDocente?: number; semestre?: number; tipo?: string } = {}
  ): Observable<MaterialResponse[]> {
    let params = new HttpParams();
    if (filtros.idDocente != null) params = params.set('idDocente', filtros.idDocente);
    if (filtros.semestre != null) params = params.set('semestre', filtros.semestre);
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    return this.http.get<MaterialResponse[]>(
      `${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.MATERIALES}/materia/${idMateria}`,
      { params }
    );
  }

  descargarMaterial(idMaterial: number): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.MATERIALES}/${idMaterial}/descargar`,
      { observe: 'response', responseType: 'blob' }
    );
  }

  obtenerPromediosMaterias(): Observable<CalificacionMateriaPromedioMateriaResponse[]> {
    return this.http.get<CalificacionMateriaPromedioMateriaResponse[]>(
      `${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.CALIFICACION_MATERIA_PROMEDIOS}`
    );
  }

  test(): Observable<string> {
    return this.http.get(`${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.TEST}`, {
      responseType: 'text'
    });
  }

  checkDatabase(): Observable<{ status: 'UP' }> {
    return this.http.get<{ status: 'UP' }>(`${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.DATABASE_HEALTH}`);
  }
}
