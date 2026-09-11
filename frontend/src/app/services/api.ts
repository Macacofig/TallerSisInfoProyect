import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Materia } from '../models/materia';
import { APP_CONFIG } from '../strings/app-config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = APP_CONFIG.API.BASE_URL;

  constructor(private http: HttpClient) {}

  obtenerMaterias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(`${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.MATERIAS}`);
  }

  test() {
    return this.http.get(`${this.apiUrl}${APP_CONFIG.API.ENDPOINTS.TEST}`, {
      responseType: 'text'
    });
  }
}
