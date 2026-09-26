import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import {
  CalificacionDocentePromedioResponse,
  CalificacionDocenteResponse
} from '../../../../../../models/calificacion-docente.model';
import { Docente } from '../../../../../../models/docente.model';
import { Materia } from '../../../../../../models/materia';
import { CalificacionesDocenteService } from '../../../../../../services/calificaciones-docente.service';
import { DocentesService } from '../../../../../../services/docentes.service';
import { DOCENTES_MESSAGES } from '../../../../../../strings/materias/docentes.messages';
import { DocentesComponent } from './docentes.component';

describe('HU-06.1: promedios de docentes por materia', () => {
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

  const promedios: CalificacionDocentePromedioResponse[] = [
    {
      idDocente: 2,
      gestionDesde: null,
      gestionHasta: null,
      claridadExplicacionesPromedio: 8.1,
      metodologiaPromedio: 7.5,
      relacionClasesEvaluacionesPromedio: 9,
      idMateria: materia.id,
      nombreDocente: 'Luis Gómez'
    },
    {
      idDocente: 1,
      gestionDesde: null,
      gestionHasta: null,
      claridadExplicacionesPromedio: 7.4,
      metodologiaPromedio: 8.1,
      relacionClasesEvaluacionesPromedio: 6.2,
      idMateria: materia.id,
      nombreDocente: 'Ana Pérez'
    }
  ];

  const calificacion: CalificacionDocenteResponse = {
    id: 10,
    idDocente: 1,
    idMateria: materia.id,
    idEstudiante: 2,
    claridadExplicaciones: 8,
    metodologia: 7,
    relacionClasesEvaluaciones: 9,
    gestion: 'año-II'
  };

  const docentesServiceMock = {
    obtenerPorMateria: vi.fn(() => of(docentes))
  };

  const calificacionesServiceMock = {
    obtenerPromediosPorMateria: vi.fn(() => of(promedios)),
    obtenerPorEstudiante: vi.fn(() => of(null)),
    registrarCalificacion: vi.fn(() => of(calificacion)),
    actualizarCalificacion: vi.fn(() => of({
      ...calificacion,
      claridadExplicaciones: 9
    })),
    eliminarCalificacion: vi.fn(() => of(void 0))
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    docentesServiceMock.obtenerPorMateria.mockReturnValue(of(docentes));
    calificacionesServiceMock.obtenerPromediosPorMateria.mockReturnValue(of(promedios));
    calificacionesServiceMock.obtenerPorEstudiante.mockReturnValue(of(null));
    calificacionesServiceMock.registrarCalificacion.mockReturnValue(of(calificacion));
    calificacionesServiceMock.actualizarCalificacion.mockReturnValue(of({
      ...calificacion,
      claridadExplicaciones: 9
    }));
    calificacionesServiceMock.eliminarCalificacion.mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [DocentesComponent],
      providers: [
        { provide: DocentesService, useValue: docentesServiceMock },
        { provide: CalificacionesDocenteService, useValue: calificacionesServiceMock }
      ]
    }).compileComponents();

    crearComponente();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('consulta docentes y promedios con el id real de la materia seleccionada', () => {
    expect(docentesServiceMock.obtenerPorMateria)
      .toHaveBeenCalledExactlyOnceWith(materia.id);
    expect(calificacionesServiceMock.obtenerPromediosPorMateria)
      .toHaveBeenCalledExactlyOnceWith(materia.id);
  });

  it('conserva la consulta de la evaluación del estudiante para cada docente', () => {
    expect(calificacionesServiceMock.obtenerPorEstudiante.mock.calls)
      .toEqual([
        [2, 1, materia.id],
        [2, 2, materia.id]
      ]);
  });

  it('relaciona cada promedio con su docente por id aunque la API cambie el orden', () => {
    expect(component.docentes[0].docente.id).toBe(1);
    expect(component.docentes[0].promedio?.idDocente).toBe(1);
    expect(component.docentes[1].docente.id).toBe(2);
    expect(component.docentes[1].promedio?.idDocente).toBe(2);
  });

  it('renderiza los valores reales y sus barras sobre la escala de diez', () => {
    const primeraTarjeta = obtenerTarjetas()[0];
    const texto = primeraTarjeta.textContent ?? '';
    const progresos = primeraTarjeta.querySelectorAll<HTMLElement>(
      '.docente-metrica__progreso'
    );

    expect(texto).toContain('7.4/10');
    expect(texto).toContain('8.1/10');
    expect(texto).toContain('6.2/10');
    expect(progresos[0].style.width).toBe('74%');
    expect(progresos[1].style.width).toBe('81%');
    expect(progresos[2].style.width).toBe('62%');
  });

  it('limita visualmente las barras entre cero y cien por ciento', () => {
    calificacionesServiceMock.obtenerPromediosPorMateria.mockReturnValue(of([{
      ...promedios[1],
      claridadExplicacionesPromedio: -1,
      metodologiaPromedio: 12,
      relacionClasesEvaluacionesPromedio: 6.2
    }]));

    component.cargarDocentes();
    fixture.detectChanges();

    const progresos = obtenerTarjetas()[0].querySelectorAll<HTMLElement>(
      '.docente-metrica__progreso'
    );
    expect(progresos[0].style.width).toBe('0%');
    expect(progresos[1].style.width).toBe('100%');
    expect(progresos[2].style.width).toBe('62%');
  });

  it('muestra un estado claro para todos los docentes cuando la lista de promedios está vacía', () => {
    calificacionesServiceMock.obtenerPromediosPorMateria.mockReturnValue(of([]));

    component.cargarDocentes();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.docente-card__sin-promedios'))
      .toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain(DOCENTES_MESSAGES.NO_AVERAGES);
  });

  it('muestra el estado sin promedio solo en el docente que no aparece en la respuesta', () => {
    calificacionesServiceMock.obtenerPromediosPorMateria.mockReturnValue(of([promedios[1]]));

    component.cargarDocentes();
    fixture.detectChanges();

    expect(component.docentes[0].promedio).toEqual(promedios[1]);
    expect(component.docentes[1].promedio).toBeNull();
    expect(obtenerTarjetas()[1].textContent).toContain(DOCENTES_MESSAGES.NO_AVERAGES);
  });

  it('conserva la lista de docentes y ofrece reintento si falla solo la consulta de promedios', () => {
    calificacionesServiceMock.obtenerPromediosPorMateria.mockReturnValue(
      throwError(() => new Error('sin promedios'))
    );

    component.cargarDocentes();
    fixture.detectChanges();

    expect(component.error).toBe('');
    expect(component.errorPromedios).toBe(DOCENTES_MESSAGES.AVERAGES_ERROR);
    expect(obtenerTarjetas()).toHaveLength(2);

    calificacionesServiceMock.obtenerPromediosPorMateria.mockReturnValue(of([promedios[1]]));
    const boton = fixture.nativeElement.querySelector(
      '.docentes__promedios-error button'
    ) as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    expect(component.errorPromedios).toBe('');
    expect(component.docentes[0].promedio).toEqual(promedios[1]);
    expect(calificacionesServiceMock.obtenerPromediosPorMateria)
      .toHaveBeenLastCalledWith(materia.id);
  });

  it('distingue el error principal de una lista de docentes vacía y permite reintentar', () => {
    docentesServiceMock.obtenerPorMateria.mockReturnValue(
      throwError(() => new Error('sin conexión'))
    );

    component.cargarDocentes();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.docentes__error')?.textContent)
      .toContain(DOCENTES_MESSAGES.LOAD_ERROR);
    expect(fixture.nativeElement.textContent).not.toContain(DOCENTES_MESSAGES.EMPTY_TITLE);

    docentesServiceMock.obtenerPorMateria.mockReturnValue(of([docentes[0]]));
    (fixture.nativeElement.querySelector('.docentes__error button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.docentes__error')).toBeNull();
    expect(obtenerTarjetas()).toHaveLength(1);
  });

  it('muestra el estado vacío sin solicitar promedios innecesarios', () => {
    vi.clearAllMocks();
    docentesServiceMock.obtenerPorMateria.mockReturnValue(of([]));

    component.cargarDocentes();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(DOCENTES_MESSAGES.EMPTY_TITLE);
    expect(obtenerTarjetas()).toHaveLength(0);
    expect(calificacionesServiceMock.obtenerPromediosPorMateria).not.toHaveBeenCalled();
  });

  it('mantiene la carga hasta que terminan las consultas de docentes', () => {
    const respuesta = new Subject<Docente[]>();
    fixture.destroy();
    docentesServiceMock.obtenerPorMateria.mockReturnValue(respuesta);

    crearComponente();

    expect(component.cargando).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(DOCENTES_MESSAGES.LOADING);

    respuesta.next([docentes[0]]);
    respuesta.complete();
    fixture.detectChanges();

    expect(component.cargando).toBe(false);
    expect(obtenerTarjetas()).toHaveLength(1);
  });

  it('cancela la consulta pendiente al destruir el componente', () => {
    const respuesta = new Subject<Docente[]>();
    docentesServiceMock.obtenerPorMateria.mockReturnValue(respuesta);
    component.cargarDocentes();

    expect(respuesta.observed).toBe(true);
    fixture.destroy();
    expect(respuesta.observed).toBe(false);
  });

  it('conserva docentes si falla la consulta del estado individual de evaluación', () => {
    calificacionesServiceMock.obtenerPorEstudiante.mockReturnValue(
      throwError(() => new Error('sin estado'))
    );

    component.cargarDocentes();
    fixture.detectChanges();

    expect(component.advertenciaEstado).toBe(DOCENTES_MESSAGES.STATUS_ERROR);
    expect(obtenerTarjetas()).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain(DOCENTES_MESSAGES.UNAVAILABLE_STATUS);
  });

  it('actualiza los promedios después de registrar una evaluación', () => {
    vi.clearAllMocks();
    calificacionesServiceMock.obtenerPromediosPorMateria.mockReturnValue(of([promedios[1]]));

    component.abrirFormulario(docentes[0]);
    component.guardarCalificacion();

    expect(calificacionesServiceMock.registrarCalificacion).toHaveBeenCalledOnce();
    expect(calificacionesServiceMock.obtenerPromediosPorMateria)
      .toHaveBeenCalledExactlyOnceWith(materia.id);
    expect(component.docentes[0].promedio).toEqual(promedios[1]);
  });

  it('actualiza los promedios después de editar una evaluación', () => {
    component.docentes[0].calificacion = calificacion;
    component.abrirDetalle(component.docentes[0]);
    component.abrirEdicion();
    vi.clearAllMocks();
    calificacionesServiceMock.obtenerPromediosPorMateria.mockReturnValue(of([promedios[1]]));

    component.guardarCalificacion();

    expect(calificacionesServiceMock.actualizarCalificacion).toHaveBeenCalledOnce();
    expect(calificacionesServiceMock.obtenerPromediosPorMateria)
      .toHaveBeenCalledExactlyOnceWith(materia.id);
  });

  it('actualiza los promedios después de eliminar una evaluación', () => {
    component.docentes[0].calificacion = calificacion;
    component.abrirDetalle(component.docentes[0]);
    vi.clearAllMocks();
    calificacionesServiceMock.obtenerPromediosPorMateria.mockReturnValue(of([]));

    component.eliminarCalificacion();

    expect(calificacionesServiceMock.eliminarCalificacion)
      .toHaveBeenCalledExactlyOnceWith(2, 1, materia.id);
    expect(calificacionesServiceMock.obtenerPromediosPorMateria)
      .toHaveBeenCalledExactlyOnceWith(materia.id);
    expect(component.docentes[0].promedio).toBeNull();
  });

  function crearComponente(): void {
    fixture = TestBed.createComponent(DocentesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('materia', materia);
    fixture.detectChanges();
  }

  function obtenerTarjetas(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.docente-card') as NodeListOf<HTMLElement>
    );
  }
});
