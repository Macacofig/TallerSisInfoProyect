import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import {
  HorarioMateriaRequest,
  HorarioNormalizacionResponse
} from '../models/horario';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  private readonly urlObtenerDatos =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.HORARIOS_OBTENER_DATOS}`;

  constructor(
    private readonly http: HttpClient
  ) {}

  obtenerDatos(
    materias: HorarioMateriaRequest[]
  ): Observable<HorarioNormalizacionResponse> {
    return this.http.post<HorarioNormalizacionResponse>(
      this.urlObtenerDatos,
      materias
    );
  }
}
