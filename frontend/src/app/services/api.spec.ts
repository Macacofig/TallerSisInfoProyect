import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ApiService } from './api';

describe('Api', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('conserva la respuesta vacía de GET /api/materias sin sustituirla por datos demo', () => {
    service.obtenerMaterias().subscribe(materias => expect(materias).toEqual([]));
    TestBed.inject(HttpTestingController)
      .expectOne({ method: 'GET', url: 'http://localhost:8081/api/materias' }).flush([]);
  });
});
