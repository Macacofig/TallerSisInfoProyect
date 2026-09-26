import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
HttpTestingController,
provideHttpClientTesting
} from '@angular/common/http/testing';

import {
CalificacionesDocenteService
} from './calificaciones-docente.service';

import {
CalificacionDocentePromedioResponse,
RegistrarCalificacionDocenteRequest
} from '../models/calificacion-docente.model';

describe('CalificacionesDocenteService', () => {

let service:
CalificacionesDocenteService;

let httpTestingController:
HttpTestingController;

const requestBody:
RegistrarCalificacionDocenteRequest = {
idDocente: 1,
idMateria: 10,
idEstudiante: 2,
claridadExplicaciones: 8,
metodologia: 7,
relacionClasesEvaluaciones: 9,
gestion: 'año-II'
};

beforeEach(async () => {
  await TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting()
    ]
  });

  service =
    TestBed.inject(
      CalificacionesDocenteService
    );

  httpTestingController =
    TestBed.inject(
      HttpTestingController
    );
  });

afterEach(() => {
httpTestingController.verify();
});

it('debería obtener los promedios de docentes con el id real de la materia', () => {
  const respuesta: CalificacionDocentePromedioResponse[] = [{
    idDocente: 1,
    gestionDesde: null,
    gestionHasta: null,
    claridadExplicacionesPromedio: 7.4,
    metodologiaPromedio: 8.1,
    relacionClasesEvaluacionesPromedio: 6.2,
    idMateria: 25,
    nombreDocente: 'Ana Pérez'
  }];

  service
    .obtenerPromediosPorMateria(25)
    .subscribe(
      resultado =>
        expect(resultado).toEqual(respuesta)
    );

  const request =
    httpTestingController.expectOne(
      'http://localhost:8081/api/calificacion-docente/materia/25/docentes'
    );

  expect(request.request.method)
    .toBe('GET');

  request.flush(respuesta);
});

it('debería obtener la evaluación de un estudiante para un docente', () => {
  const respuesta = {
    id: 1,
    ...requestBody
  };

  service
    .obtenerPorEstudiante(2, 1, 10)
    .subscribe(
      resultado =>
        expect(resultado).toEqual(respuesta)
    );

  const request =
    httpTestingController.expectOne(
      'http://localhost:8081/api/calificacion-docente/estudiante/2/docente/1/materia/10'
    );

  expect(request.request.method)
    .toBe('GET');

  request.flush(respuesta);
});

it('debería aceptar respuesta vacía cuando aún no existe evaluación', () => {
  service
    .obtenerPorEstudiante(2, 2, 10)
    .subscribe(
      resultado =>
        expect(resultado).toBeNull()
    );

  const request =
    httpTestingController.expectOne(
      'http://localhost:8081/api/calificacion-docente/estudiante/2/docente/2/materia/10'
    );

  request.flush(null);
});

it('debería registrar una evaluación', () => {
  service
    .registrarCalificacion(
      requestBody
    )
    .subscribe();

  const request =
    httpTestingController.expectOne(
      'http://localhost:8081/api/calificacion-docente'
    );

  expect(request.request.method)
    .toBe('POST');

  expect(request.request.body)
    .toEqual(requestBody);

  request.flush({
    id: 1,
    ...requestBody
  });
});

it('debería actualizar una evaluación', () => {
  service
    .actualizarCalificacion(
      2,
      1,
      10,
      requestBody
    )
    .subscribe();

  const request =
    httpTestingController.expectOne(
      'http://localhost:8081/api/calificacion-docente/estudiante/2/docente/1/materia/10'
    );

  expect(request.request.method)
    .toBe('PUT');

  expect(request.request.body)
    .toEqual(requestBody);

  request.flush({
    id: 1,
    ...requestBody
  });
});

it('debería eliminar una evaluación', () => {
  service
    .eliminarCalificacion(
      2,
      1,
      10
    )
    .subscribe();

  const request =
    httpTestingController.expectOne(
      'http://localhost:8081/api/calificacion-docente/estudiante/2/docente/1/materia/10'
    );

  expect(request.request.method)
    .toBe('DELETE');

  request.flush(null);

  });
});
