import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { DocentesService } from './docentes.service';

describe('DocentesService', () => {

  let service: DocentesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service =
      TestBed.inject(DocentesService);

    httpTestingController =
      TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('debería obtener los docentes de una materia', () => {

    const docentes = [
      {
        id: 1,
        nombre: 'Docente QA',
        idMateria: 1
      },
      {
        id: 2,
        nombre: 'Docente QA',
        idMateria: 1
      }
    ];

    service
      .obtenerPorMateria(1)
      .subscribe(
        respuesta =>
          expect(respuesta).toEqual(docentes)
      );

    const request =
      httpTestingController.expectOne(
        'http://localhost:8081/api/docentes/materia/1'
      );

    expect(request.request.method)
      .toBe('GET');

    request.flush(docentes);
  });

  it('debería conservar una lista vacía cuando la materia no tiene docentes', () => {

    service
      .obtenerPorMateria(2)
      .subscribe(
        respuesta =>
          expect(respuesta).toEqual([])
      );

    const request =
      httpTestingController.expectOne(
        'http://localhost:8081/api/docentes/materia/2'
      );

    expect(request.request.method)
      .toBe('GET');

    request.flush([]);
  });
});
