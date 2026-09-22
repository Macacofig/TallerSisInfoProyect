import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  of
} from 'rxjs';

import {
  DocentesComponent
} from './docentes.component';

import {
  DocentesService
} from '../../../../../../services/docentes.service';

import {
  CalificacionesDocenteService
} from '../../../../../../services/calificaciones-docente.service';

import {
  Materia
} from '../../../../../../models/materia';

describe('DocentesComponent', () => {

  let fixture:
    ComponentFixture<DocentesComponent>;

  let component:
    DocentesComponent;

  const materia =
    {
      id: 1,
      codigo: 'SIS101',
      nombre: 'Programación I',
      carrera: 'Ingeniería de Sistemas',
      semestre: 1
    } as Materia;

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

  const docentesServiceMock = {
    obtenerPorMateria:
      () => of(docentes)
  };

  const calificacionesServiceMock = {
    obtenerPorEstudiante:
      () => of(null),

    registrarCalificacion:
      () => of({
        id: 10,
        idDocente: 1,
        idEstudiante: 2,
        claridadExplicaciones: 8,
        metodologia: 7,
        relacionClasesEvaluaciones: 9,
        gestion: 'año-II'
      }),

    actualizarCalificacion:
      () => of({
        id: 10,
        idDocente: 1,
        idEstudiante: 2,
        claridadExplicaciones: 9,
        metodologia: 8,
        relacionClasesEvaluaciones: 10,
        gestion: 'año-II'
      }),

    eliminarCalificacion:
      () => of(void 0)
  };

  beforeEach(async () => {

    await TestBed
      .configureTestingModule({
        imports: [
          DocentesComponent
        ],
        providers: [
          {
            provide: DocentesService,
            useValue: docentesServiceMock
          },
          {
            provide:
              CalificacionesDocenteService,
            useValue:
              calificacionesServiceMock
          }
        ]
      })
      .compileComponents();

    fixture =
      TestBed.createComponent(
        DocentesComponent
      );

    component =
      fixture.componentInstance;

    fixture.componentRef
      .setInput(
        'materia',
        materia
      );

    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar los docentes de la materia', () => {

    const texto =
      fixture.nativeElement
        .textContent as string;

    expect(texto)
      .toContain('Docente I');

    expect(texto)
      .toContain('Docente II');

    expect(texto)
      .toContain('Programación I');
  });

  it('debería mostrar el estado pendiente cuando no existe evaluación', () => {

    const texto =
      fixture.nativeElement
        .textContent as string;

    expect(texto)
      .toContain(
        'Pendiente de evaluación'
      );
  });

  it('debería abrir el formulario de calificación', () => {

    component
      .abrirFormulario(
        docentes[0]
      );

    fixture.detectChanges();

    expect(
      component.mostrarFormulario
    ).toBe(true);

    expect(
      component.docenteSeleccionado?.id
    ).toBe(1);
  });

  it('debería inicializar los tres criterios en 5', () => {

    component
      .abrirFormulario(
        docentes[0]
      );

    expect(
      component.obtenerValor(
        'claridadExplicaciones'
      )
    ).toBe(5);

    expect(
      component.obtenerValor(
        'metodologia'
      )
    ).toBe(5);

    expect(
      component.obtenerValor(
        'relacionClasesEvaluaciones'
      )
    ).toBe(5);
  });

  it('debería pasar a confirmación cuando el formulario es válido', () => {

    component
      .abrirFormulario(
        docentes[0]
      );

    component
      .continuarConfirmacion();

    expect(
      component.mostrarConfirmacion
    ).toBe(true);
  });

  it('debería generar alias visuales distintos para docentes QA duplicados', () => {

    expect(
      component.obtenerNombreVisible(
        docentes[0]
      )
    ).toBe('Docente I');

    expect(
      component.obtenerNombreVisible(
        docentes[1]
      )
    ).toBe('Docente II');
  });
});
