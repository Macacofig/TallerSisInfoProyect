import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Materia } from '../models/materia';
import { APP_CONFIG } from '../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  private readonly apiUrl =
    `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.MATERIAS}`;

  constructor(
    private readonly http: HttpClient
  ) {}

  obtenerMaterias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(this.apiUrl);
  }

  obtenerMateriaPorId(
    materiaId: number
  ): Observable<Materia | null> {

    return this.obtenerMaterias().pipe(
      map(
        (materias) =>
          materias.find(
            (materia) => materia.id === materiaId
          ) ?? null
      )
    );
  }
}