import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import { Docente } from '../models/docente.model';

@Injectable({
  providedIn: 'root'
})
export class DocentesService {

  private readonly apiUrl =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.DOCENTES}`;

  constructor(
    private readonly http: HttpClient
  ) {}

  obtenerPorMateria(
    idMateria: number
  ): Observable<Docente[]> {

    const url =
      `${this.apiUrl}/materia/${idMateria}`;

    return this.http.get<Docente[]>(
      url
    );
  }
}
