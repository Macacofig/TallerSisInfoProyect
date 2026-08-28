import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  test() {
    return this.http.get(`${this.apiUrl}/test`, {
      responseType: 'text'
    });
  }
}