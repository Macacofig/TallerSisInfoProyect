import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import {
  HorarioMateriaRequest,
  HorarioNormalizacionResponse,
  HorarioGeneracionRequest,
  HorarioResponse2
} from '../models/horario';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  private readonly http = inject(HttpClient);
  private readonly api = APP_CONFIG.API;

  obtenerDatos(materias: HorarioMateriaRequest[]): Observable<HorarioNormalizacionResponse> {
    return this.http.post<HorarioNormalizacionResponse>(
      `${this.api.BASE_URL}${this.api.ENDPOINTS.HORARIOS_OBTENER_DATOS}`,
      materias
    );
  }

  generarHorarios(request: HorarioGeneracionRequest): Observable<HorarioResponse2[]> {
    return this.http.post<HorarioResponse2[]>(
      `${this.api.BASE_URL}${this.api.ENDPOINTS.HORARIOS_GENERAR}`,
      request
    );
  }
}
