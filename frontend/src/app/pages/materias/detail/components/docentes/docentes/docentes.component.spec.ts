import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { Docente } from '../../../../../../models/docente.model';
import { Materia } from '../../../../../../models/materia';
import { CalificacionesDocenteService } from '../../../../../../services/calificaciones-docente.service';
import { DocentesService } from '../../../../../../services/docentes.service';
import { DOCENTES_MESSAGES } from '../../../../../../strings/materias/docentes.messages';
import { DocentesComponent } from './docentes.component';

describe('HU-06: consultar docentes de una materia', () => {
  let fixture: ComponentFixture<DocentesComponent>;
  let component: DocentesComponent;

  const materia: Materia = {
    id: 25,
    codigo: 'SIS101',
    nombre: 'Programación I',
    carrera: 'Ingeniería de Sistemas',
    semestre: 1
  };

  const docentes: Docente[] = [
    { id: 1, nombre: 'Ana Pérez', idMateria: materia.id },
    { id: 2, nombre: 'Luis Gómez', idMateria: materia.id }
  ];

  const docentesServiceMock = {
    obtenerPorMateria: vi.fn(() => of(docentes))
  };

  const calificacionesServiceMock = {
    obtenerPorEstudiante: vi.fn(() => of(null)),
    registrarCalificacion: vi.fn(() => of({
      id: 10,
      idDocente: 1,
      idEstudiante: 2,
      claridadExplicaciones: 8,
      metodologia: 7,
      relacionClasesEvaluaciones: 9,
      gestion: 'año-II' as const
    })),
    actualizarCalificacion: vi.fn(() => of({
      id: 10,
      idDocente: 1,
      idEstudiante: 2,
      claridadExplicaciones: 9,
      metodologia: 8,
      relacionClasesEvaluaciones: 10,
      gestion: 'año-II' as const
    })),
    eliminarCalificacion: vi.fn(() => of(void 0))
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    docentesServiceMock.obtenerPorMateria.mockReturnValue(of(docentes));
    calificacionesServiceMock.obtenerPorEstudiante.mockReturnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [DocentesComponent],
      providers: [
        { provide: DocentesService, useValue: docentesServiceMock },
        { provide: CalificacionesDocenteService, useValue: calificacionesServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocentesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('materia', materia);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('consulta la API con el id real de la materia seleccionada', () => {
    expect(docentesServiceMock.obtenerPorMateria)
      .toHaveBeenCalledExactlyOnceWith(materia.id);
  });

  it('muestra todos los docentes devueltos por la API con sus nombres reales', () => {
    const texto = fixture.nativeElement.textContent as string;

    expect(component.docentes.map(item => item.docente)).toEqual(docentes);
    expect(texto).toContain('Ana Pérez');
    expect(texto).toContain('Luis Gómez');
    expect(texto).toContain(materia.nombre);
  });

  it('conserva el nombre real aunque existan docentes con nombres duplicados', () => {
    const duplicados: Docente[] = [
      { id: 3, nombre: 'Docente QA', idMateria: materia.id },
      { id: 4, nombre: 'Docente QA', idMateria: materia.id }
    ];
    docentesServiceMock.obtenerPorMateria.mockReturnValue(of(duplicados));

    component.cargarDocentes();
    fixture.detectChanges();

    const nombres = Array.from(
      fixture.nativeElement.querySelectorAll('.docente-card h3') as NodeListOf<HTMLHeadingElement>,
      elemento => elemento.textContent?.trim()
    );
    expect(nombres).toEqual(['Docente QA', 'Docente QA']);
  });

  it('muestra un mensaje informativo cuando la API devuelve una lista vacía', () => {
    docentesServiceMock.obtenerPorMateria.mockReturnValue(of([]));

    component.cargarDocentes();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(DOCENTES_MESSAGES.EMPTY_TITLE);
    expect(fixture.nativeElement.textContent).toContain(DOCENTES_MESSAGES.EMPTY_DESCRIPTION);
    expect(fixture.nativeElement.querySelectorAll('.docente-card')).toHaveLength(0);
  });

  it('distingue el error de consulta de una lista vacía y permite reintentar', () => {
    docentesServiceMock.obtenerPorMateria.mockReturnValue(
      throwError(() => new Error('sin conexión'))
    );

    component.cargarDocentes();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain(DOCENTES_MESSAGES.LOAD_ERROR);
    expect(fixture.nativeElement.textContent).not.toContain(DOCENTES_MESSAGES.EMPTY_TITLE);

    docentesServiceMock.obtenerPorMateria.mockReturnValue(of([docentes[0]]));
    (fixture.nativeElement.querySelector('.docentes__error button') as HTMLButtonElement | null)?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Ana Pérez');
  });

  it('mantiene el estado de carga hasta que finaliza la petición', () => {
    const respuesta = new Subject<Docente[]>();
    fixture.destroy();
    docentesServiceMock.obtenerPorMateria.mockReturnValue(respuesta);

    fixture = TestBed.createComponent(DocentesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('materia', materia);
    fixture.detectChanges();

    expect(component.cargando).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(DOCENTES_MESSAGES.LOADING);

    respuesta.next([docentes[0]]);
    respuesta.complete();
    fixture.detectChanges();

    expect(component.cargando).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain(DOCENTES_MESSAGES.LOADING);
    expect(fixture.nativeElement.textContent).toContain('Ana Pérez');
  });

  it('sigue mostrando docentes si falla la consulta secundaria de evaluaciones', () => {
    calificacionesServiceMock.obtenerPorEstudiante.mockReturnValue(
      throwError(() => new Error('sin estado'))
    );

    component.cargarDocentes();
    fixture.detectChanges();

    expect(component.error).toBe('');
    expect(component.advertenciaEstado).toBe(DOCENTES_MESSAGES.STATUS_ERROR);
    expect(fixture.nativeElement.querySelectorAll('.docente-card')).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain(DOCENTES_MESSAGES.UNAVAILABLE_STATUS);
    expect(fixture.nativeElement.textContent).not.toContain(DOCENTES_MESSAGES.PENDING_STATUS);
  });

  it('cancela la consulta pendiente al abandonar la sección', () => {
    const respuesta = new Subject<Docente[]>();
    docentesServiceMock.obtenerPorMateria.mockReturnValue(respuesta);
    component.cargarDocentes();

    expect(respuesta.observed).toBe(true);
    fixture.destroy();
    expect(respuesta.observed).toBe(false);
  });

  it('abre el formulario de calificación y conserva los tres criterios existentes', () => {
    component.abrirFormulario(docentes[0]);

    expect(component.mostrarFormulario).toBe(true);
    expect(component.docenteSeleccionado?.id).toBe(1);
    expect(component.obtenerValor('claridadExplicaciones')).toBe(5);
    expect(component.obtenerValor('metodologia')).toBe(5);
    expect(component.obtenerValor('relacionClasesEvaluaciones')).toBe(5);
  });
});
