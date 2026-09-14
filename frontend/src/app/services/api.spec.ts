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

  it('envía solo el parámetro nombre, conservando acentos y caracteres especiales', () => {
    const nombre = 'Programación & Diseño + I';
    service.obtenerMaterias(`  ${nombre}  `).subscribe();
    const peticion = TestBed.inject(HttpTestingController).expectOne(req =>
      req.url === 'http://localhost:8081/api/materias' && req.params.get('nombre') === nombre);
    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.params.keys()).toEqual(['nombre']);
    expect(peticion.request.urlWithParams).toContain('%26');
    expect(peticion.request.urlWithParams).toContain('%2B');
    peticion.flush([]);
  });

  it('omite el parámetro nombre cuando se limpia la búsqueda', () => {
    service.obtenerMaterias('   ').subscribe();
    const peticion = TestBed.inject(HttpTestingController)
      .expectOne({ method: 'GET', url: 'http://localhost:8081/api/materias' });
    expect(peticion.request.params.keys()).toEqual([]);
    peticion.flush([]);
  });

  it('combina nombre y carrera conservando caracteres especiales y recortando espacios', () => {
    service.obtenerMaterias('  Diseño  ', '  Administración & Gestión + I  ').subscribe();
    const peticion = TestBed.inject(HttpTestingController).expectOne(req =>
      req.url === 'http://localhost:8081/api/materias' &&
      req.params.get('nombre') === 'Diseño' &&
      req.params.get('carrera') === 'Administración & Gestión + I');
    expect(peticion.request.params.keys()).toEqual(['nombre', 'carrera']);
    expect(peticion.request.urlWithParams).toContain('%26');
    expect(peticion.request.urlWithParams).toContain('%2B');
    peticion.flush([]);
  });

  it('omite ambos parámetros cuando se selecciona Todas y el nombre está vacío', () => {
    service.obtenerMaterias('   ', '   ').subscribe();
    const peticion = TestBed.inject(HttpTestingController).expectOne('http://localhost:8081/api/materias');
    expect(peticion.request.params.keys()).toEqual([]);
    peticion.flush([]);
  });
});
