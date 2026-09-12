import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Materia } from '../models/materia';
import { APP_CONFIG } from '../strings/app-config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = APP_CONFIG.API.BASE_URL;

  constructor(private http: HttpClient) {}

  obtenerMaterias(nombre = ''): Observable<Materia[]> {
    const termino = nombre.trim();
    const params = termino ? new HttpParams().set('nombre', termino) : new HttpParams();
    return this.http.get<Materia[]>(`${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.MATERIAS}`, { params });
  }

  test() {
    return this.http.get(`${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.TEST}`, {
      responseType: 'text'
    });
  }
}
