import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest
} from '@angular/common/http/testing';

import { HorariosComponent } from './horarios.component';
import { HORARIOS_MESSAGES } from '../../strings/horarios/horarios.messages';
import { HORARIOS_MESSAGES as HORARIOS_MESSAGES_EN } from '../../strings/horarios/horarios-ingles.messages';
import { LanguageService } from '../../services/language.service';
import {
  HorarioMateriaRequest,
  HorarioNormalizacionResponse
} from '../../models/horario';

const URL_OBTENER_DATOS = '/horarios/obtenerDatos';

function expectObtenerDatos(http: HttpTestingController): TestRequest {
  return http.expectOne(
    request => request.url.includes(URL_OBTENER_DATOS)
  );
}

function crearCruda(
  overrides: Partial<HorarioMateriaRequest> = {}
): HorarioMateriaRequest {
  return {
    siglaMateria: 'INF-101',
    nombreMateria: 'Programación I',
    paralelo: 1,
    horarios: [
      { docenteNombre: 'Ana Torres', dia: 1, horas: '08:00 - 10:00' }
    ],
    ...overrides
  };
}

function respuestaEjemplo(): HorarioNormalizacionResponse {
  return {
    sessionId: 'sesion-1',
    materias: [
      {
        idMateria: 2,
        NombreMateria: 'Estructuras de Datos',
        Ofertas: [
          {
            idDocente: 3,
            Docente: 'Luis Vega',
            Paralelo: 1,
            Horarios: [{ Dia: 'Martes', Horas: '09:30 - 10:45' }]
          }
        ]
      },
      {
        idMateria: 1,
        NombreMateria: 'Programación I',
        Ofertas: [
          {
            idDocente: 1,
            Docente: 'Ana Torres',
            Paralelo: 1,
            Horarios: [
              { Dia: 'Lunes', Horas: '08:00 - 10:00' },
              { Dia: 'Miércoles', Horas: '08:00 - 10:00' }
            ]
          },
          {
            idDocente: 2,
            Docente: 'Pedro Salas',
            Paralelo: 2,
            Horarios: [
              { Dia: 'Martes', Horas: '14:00 - 16:00' },
              { Dia: 'Jueves', Horas: '14:00 - 16:00' }
            ]
          }
        ]
      }
    ]
  };
}

describe('HorariosComponent', () => {
  let component: HorariosComponent;
  let fixture: ComponentFixture<HorariosComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    TestBed.inject(LanguageService).setLanguage('es');
    fixture = TestBed.createComponent(HorariosComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function llenarFormulario(
    overrides: {
      sigla?: string;
      nombre?: string;
      paralelo?: number;
      docente?: string;
    } = {}
  ): void {
    component.formulario.sigla = overrides.sigla ?? 'INF-101';
    component.formulario.nombre = overrides.nombre ?? 'Programación I';
    component.formulario.paralelo = overrides.paralelo ?? 1;
    component.formulario.docente = overrides.docente ?? 'Ana Torres';
    component.formulario.bloques = [
      { dia: 1, horaInicio: '08:00', horaFin: '10:00' }
    ];
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with an empty panel and no pending subjects', () => {
    expect(component.materias.length).toBe(0);
    expect(component.materiasCrudas.length).toBe(0);
    expect(component.materiasSeleccionadas.length).toBe(0);
    expect(component.hayHorarios).toBe(false);
    expect(component.totalHorarios).toBe(0);
  });

  it('does not request the backend on startup', () => {
    http.expectNone(request => request.url.includes(URL_OBTENER_DATOS));
  });

  it('displays the semester subjects title in Spanish', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      HORARIOS_MESSAGES.SEMESTER_SUBJECTS
    );
  });

  /* =========================
     FORMULARIO
     ========================= */

  it('opens the add modal with an empty form', () => {
    component.abrirModalAgregar();

    expect(component.modalAgregarAbierto).toBe(true);
    expect(component.formulario.sigla).toBe('');
    expect(component.formulario.bloques.length).toBe(1);
  });

  it('validates the form before adding a subject', () => {
    expect(component.formularioValido).toBe(false);

    llenarFormulario();
    expect(component.formularioValido).toBe(true);

    component.formulario.bloques[0].horaFin = '07:00';
    expect(component.formularioValido).toBe(false);
  });

  it('adds a subject to the raw list and clears the form', () => {
    llenarFormulario();
    component.agregarMateria();

    expect(component.materiasCrudas).toEqual([
      {
        siglaMateria: 'INF-101',
        paralelo: 1,
        nombreMateria: 'Programación I',
        horarios: [
          { docenteNombre: 'Ana Torres', dia: 1, horas: '08:00 - 10:00' }
        ]
      }
    ]);

    expect(component.formulario.sigla).toBe('');
    expect(component.formulario.bloques.length).toBe(1);
  });

  it('blocks a duplicated subject with a controlled error', () => {
    llenarFormulario();
    component.agregarMateria();

    llenarFormulario();
    component.agregarMateria();

    expect(component.materiasCrudas.length).toBe(1);
    expect(component.errorFormulario).toBe(
      HORARIOS_MESSAGES.DUPLICATE_SUBJECT
    );

    component.formulario.paralelo = 2;
    component.agregarMateria();

    expect(component.materiasCrudas.length).toBe(2);
    expect(component.errorFormulario).toBe('');
  });

  it('reuses a pending subject into the form', () => {
    component.materiasCrudas.push(crearCruda());

    component.reutilizarMateria(0);

    expect(component.formulario.sigla).toBe('INF-101');
    expect(component.formulario.nombre).toBe('Programación I');
    expect(component.formulario.docente).toBe('Ana Torres');
    expect(component.formulario.paralelo).toBe(1);
    expect(component.formulario.bloques.length).toBe(1);
  });

  it('ignores an incomplete subject', () => {
    component.formulario.sigla = 'INF-101';
    component.agregarMateria();

    expect(component.materiasCrudas.length).toBe(0);
  });

  it('adds and removes schedule blocks', () => {
    component.agregarBloque();
    expect(component.formulario.bloques.length).toBe(2);

    component.quitarBloque(0);
    expect(component.formulario.bloques.length).toBe(1);

    component.quitarBloque(0);
    expect(component.formulario.bloques.length).toBe(1);
  });

  it('removes a pending subject by index', () => {
    component.materiasCrudas.push(crearCruda(), crearCruda({
      siglaMateria: 'INF-202',
      nombreMateria: 'Estructuras de Datos'
    }));

    component.quitarMateriaCruda(0);

    expect(component.materiasCrudas.length).toBe(1);
    expect(component.materiasCrudas[0].siglaMateria).toBe('INF-202');
  });

  it('renders the pending subjects with their teacher and schedule', () => {
    component.materiasCrudas.push(crearCruda());

    const boton = fixture.nativeElement.querySelector(
      '.header-actions .btn-agregar'
    ) as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(component.modalAgregarAbierto).toBe(true);
    expect(texto).toContain('Programación I');
    expect(texto).toContain('Ana Torres');
    expect(texto).toContain('Lunes 08:00-10:00');
  });

  /* =========================
     ENVÍO AL BACKEND
     ========================= */

  it('sends the raw subjects in the format expected by obtenerDatos', () => {
    component.materiasCrudas.push(
      crearCruda(),
      crearCruda({ paralelo: 2, horarios: [
        { docenteNombre: 'Pedro Salas', dia: 2, horas: '14:00 - 16:00' }
      ] }),
      crearCruda({
        siglaMateria: 'INF-202',
        nombreMateria: 'Estructuras de Datos',
        horarios: [
          { docenteNombre: 'Luis Vega', dia: 2, horas: '09:30 - 10:45' }
        ]
      })
    );

    component.enviarMaterias();
    fixture.detectChanges();

    const peticion = expectObtenerDatos(http);
    const cuerpo = peticion.request.body as HorarioMateriaRequest[];

    expect(peticion.request.method).toBe('POST');
    expect(cuerpo).toEqual(component.materiasCrudas);

    // El backend solo reconoce camelCase: PascalCase o sufijo "1" responde 500.
    expect(Object.keys(cuerpo[0]).sort()).toEqual([
      'horarios',
      'nombreMateria',
      'paralelo',
      'siglaMateria'
    ]);
    expect(Object.keys(cuerpo[0].horarios[0]).sort()).toEqual([
      'dia',
      'docenteNombre',
      'horas'
    ]);

    expect(cuerpo[0].siglaMateria).toBe('INF-101');
    expect(cuerpo[0].horarios[0]).toEqual({
      docenteNombre: 'Ana Torres',
      dia: 1,
      horas: '08:00 - 10:00'
    });

    peticion.flush({ sessionId: 'sesion-1', materias: [] });
  });

  it('builds the left panel from the obtenerDatos response', () => {
    component.materiasCrudas.push(
      crearCruda(),
      crearCruda({ paralelo: 2, horarios: [
        { docenteNombre: 'Pedro Salas', dia: 2, horas: '14:00 - 16:00' }
      ] }),
      crearCruda({
        siglaMateria: 'INF-202',
        nombreMateria: 'Estructuras de Datos',
        horarios: [
          { docenteNombre: 'Luis Vega', dia: 2, horas: '09:30 - 10:45' }
        ]
      })
    );

    component.enviarMaterias();
    fixture.detectChanges();

    expectObtenerDatos(http).flush(respuestaEjemplo());
    fixture.detectChanges();

    expect(component.materias.map(materia => materia.codigo)).toEqual([
      'INF-101',
      'INF-202'
    ]);

    const programacion = component.materias[0];
    expect(programacion.nombre).toBe('Programación I');
    expect(programacion.seleccionada).toBe(true);
    expect(programacion.opciones.length).toBe(2);
    expect(programacion.opciones[0]).toEqual({
      idDocente: 1,
      docente: 'Ana Torres',
      paralelo: 1,
      horario: 'Lunes 08:00-10:00 · Miércoles 08:00-10:00',
      obligatorio: false
    });

    expect(component.materiasSeleccionadas.map(materia => materia.codigo))
      .toEqual(['INF-101', 'INF-202']);
    expect(component.totalHorarios).toBe(2);
  });

  it('keeps the panel empty when obtenerDatos fails', () => {
    component.materiasCrudas.push(crearCruda());
    component.enviarMaterias();
    fixture.detectChanges();

    expectObtenerDatos(http).error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect(component.materias.length).toBe(0);
    expect(component.hayHorarios).toBe(false);
  });

  /* =========================
     OFERTAS Y CALENDARIO
     ========================= */

  function cargarPanel(): void {
    component.materiasCrudas.push(
      crearCruda(),
      crearCruda({ paralelo: 2, horarios: [
        { docenteNombre: 'Pedro Salas', dia: 2, horas: '14:00 - 16:00' }
      ] }),
      crearCruda({
        siglaMateria: 'INF-202',
        nombreMateria: 'Estructuras de Datos',
        horarios: [
          { docenteNombre: 'Luis Vega', dia: 2, horas: '09:30 - 10:45' }
        ]
      })
    );

    component.enviarMaterias();
    fixture.detectChanges();
    expectObtenerDatos(http).flush(respuestaEjemplo());
    fixture.detectChanges();
  }

  it('shows the schedule option that matches the current page', () => {
    cargarPanel();

    const programacion = component.materias[0];
    expect(component.obtenerBloquesMateria(programacion, 'Lunes')).toEqual([
      { inicio: '08:00', fin: '10:00' }
    ]);

    component.siguiente();
    fixture.detectChanges();

    expect(component.paginaActual).toBe(2);
    expect(component.obtenerBloquesMateria(programacion, 'Lunes')).toEqual([]);
    expect(component.obtenerBloquesMateria(programacion, 'Martes')).toEqual([
      { inicio: '14:00', fin: '16:00' }
    ]);
  });

  it('expands a subject to list its offers with teacher and schedule', () => {
    cargarPanel();

    const tarjeta = fixture.nativeElement.querySelector(
      '.materia-horario'
    ) as HTMLElement;
    const toggle = tarjeta.querySelector(
      '.materia-horario__toggle'
    ) as HTMLButtonElement;

    expect(tarjeta.querySelectorAll('.oferta').length).toBe(0);

    toggle.click();
    fixture.detectChanges();

    const ofertas = tarjeta.querySelectorAll('.oferta');
    expect(ofertas.length).toBe(2);
    expect(component.estaExpandida(component.materias[0])).toBe(true);

    const texto = tarjeta.textContent ?? '';
    expect(texto).toContain('Ana Torres');
    expect(texto).toContain('Pedro Salas');

    toggle.click();
    fixture.detectChanges();

    expect(tarjeta.querySelectorAll('.oferta').length).toBe(0);
    expect(component.estaExpandida(component.materias[0])).toBe(false);
  });

  it('detects a subject inside and outside its schedule', () => {
    cargarPanel();

    const estructuras = component.materias.find(
      materia => materia.codigo === 'INF-202'
    );

    expect(estructuras).toBeTruthy();
    expect(component.estaMateriaEnHorario(estructuras!, 'Martes', '09:30'))
      .toBe(true);
    expect(component.estaMateriaEnHorario(estructuras!, 'Lunes', '09:30'))
      .toBe(false);
  });

  it('toggles subject selection in the calendar', () => {
    cargarPanel();

    const programacion = component.materias[0];
    component.seleccionarMateria(programacion);

    expect(programacion.seleccionada).toBe(false);
    expect(
      component.materiasSeleccionadas.some(
        materia => materia.codigo === 'INF-101'
      )
    ).toBe(false);
  });

  /* =========================
     PAGINACIÓN
     ========================= */

  it('initializes pagination from the selected subjects', () => {
    cargarPanel();

    expect(component.totalHorarios).toBe(2);
    expect(component.paginaActual).toBe(1);
  });

  it('moves between schedule pages', () => {
    cargarPanel();

    component.siguiente();
    expect(component.paginaActual).toBe(2);

    component.siguiente();
    expect(component.paginaActual).toBe(2);

    component.anterior();
    expect(component.paginaActual).toBe(1);

    component.anterior();
    expect(component.paginaActual).toBe(1);
  });

  /* =========================
     FILTROS DE GENERACIÓN
     ========================= */

  it('builds the default filters payload', () => {
    cargarPanel();

    expect(component.construirFiltros()).toEqual({
      cantidadMaterias: { min: 4, max: 6 },
      materiasObligatorias: [],
      materiasExcluidas: [],
      docentes: {},
      evitarHuecos: false
    });
  });

  it('marks a subject as required or excluded keeping them exclusive', () => {
    cargarPanel();

    const programacion = component.materias[0];

    component.alternarObligatoria(programacion);

    expect(programacion.estadoFiltro).toBe('obligatoria');
    expect(component.construirFiltros().materiasObligatorias).toEqual([1]);

    component.alternarExcluida(programacion);

    expect(programacion.estadoFiltro).toBe('excluida');
    expect(component.construirFiltros().materiasObligatorias).toEqual([]);
    expect(component.construirFiltros().materiasExcluidas).toEqual([1]);

    component.alternarExcluida(programacion);

    expect(programacion.estadoFiltro).toBe('normal');
  });

  it('requires a subject and its teacher in the filters payload', () => {
    cargarPanel();

    const programacion = component.materias[0];
    component.alternarObligatoria(programacion);
    component.alternarDocenteObligatorio(programacion.opciones[0]);

    const filtros = component.construirFiltros();

    expect(filtros.materiasObligatorias).toEqual([1]);
    expect(filtros.docentes).toEqual({ 1: [1] });

    component.alternarDocenteObligatorio(programacion.opciones[0]);

    expect(component.construirFiltros().docentes).toEqual({});
  });

  it('ignores the teachers of an excluded subject', () => {
    cargarPanel();

    const estructuras = component.materias.find(
      materia => materia.codigo === 'INF-202'
    );

    expect(estructuras).toBeTruthy();

    component.alternarExcluida(estructuras!);
    component.alternarDocenteObligatorio(estructuras!.opciones[0]);

    const filtros = component.construirFiltros();

    expect(filtros.materiasExcluidas).toEqual([2]);
    expect(filtros.docentes).toEqual({});
  });

  it('normalizes the subject count range', () => {
    component.cantidadMin = 2;
    component.cantidadMax = 1;

    expect(component.construirFiltros().cantidadMaterias).toEqual({
      min: 2,
      max: 2
    });

    component.cantidadMin = 0;
    component.cantidadMax = Number('');

    expect(component.construirFiltros().cantidadMaterias).toEqual({
      min: 1,
      max: 1
    });

    component.cantidadMin = 3;
    component.cantidadMax = 5;

    expect(component.construirFiltros().cantidadMaterias).toEqual({
      min: 3,
      max: 5
    });
  });

  it('toggles the no-gaps filter from the panel', () => {
    const casilla = fixture.nativeElement.querySelector(
      '.panel-filtros__huecos input'
    ) as HTMLInputElement;

    expect(component.evitarHuecos).toBe(false);

    casilla.click();
    fixture.detectChanges();

    expect(component.evitarHuecos).toBe(true);
    expect(component.construirFiltros().evitarHuecos).toBe(true);
  });

  it('toggles the required and excluded chips of a subject', () => {
    cargarPanel();

    const tarjeta = fixture.nativeElement.querySelector(
      '.materia-horario'
    ) as HTMLElement;
    const [obligatoria, excluida] = Array.from(
      tarjeta.querySelectorAll('.materia-horario__filtros .chip')
    ) as HTMLButtonElement[];

    expect(obligatoria.getAttribute('aria-pressed')).toBe('false');

    obligatoria.click();
    fixture.detectChanges();

    expect(component.materias[0].estadoFiltro).toBe('obligatoria');
    expect(obligatoria.getAttribute('aria-pressed')).toBe('true');

    excluida.click();
    fixture.detectChanges();

    expect(component.materias[0].estadoFiltro).toBe('excluida');
    expect(obligatoria.getAttribute('aria-pressed')).toBe('false');
    expect(excluida.getAttribute('aria-pressed')).toBe('true');
  });

  it('marks a teacher as required from the expanded offers', () => {
    cargarPanel();

    const tarjeta = fixture.nativeElement.querySelector(
      '.materia-horario'
    ) as HTMLElement;
    const toggle = tarjeta.querySelector(
      '.materia-horario__toggle'
    ) as HTMLButtonElement;

    toggle.click();
    fixture.detectChanges();

    const chip = tarjeta.querySelector(
      '.oferta .chip--docente'
    ) as HTMLButtonElement;

    expect(chip.textContent).toContain(HORARIOS_MESSAGES.TEACHER_FREE);

    chip.click();
    fixture.detectChanges();

    expect(component.materias[0].opciones[0].obligatorio).toBe(true);
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(chip.textContent).toContain(HORARIOS_MESSAGES.TEACHER_REQUIRED);
  });

  it('keeps the subject filters when the panel is rebuilt', () => {
    cargarPanel();

    component.alternarObligatoria(component.materias[0]);

    component.materiasCrudas.push(crearCruda({
      siglaMateria: 'INF-305',
      nombreMateria: 'Bases de Datos'
    }));
    component.enviarMaterias();
    fixture.detectChanges();

    expectObtenerDatos(http).flush(respuestaEjemplo());
    fixture.detectChanges();

    const programacion = component.materias.find(
      materia => materia.codigo === 'INF-101'
    );

    expect(programacion?.estadoFiltro).toBe('obligatoria');
    expect(component.construirFiltros().materiasObligatorias).toEqual([1]);
  });

  /* =========================
     MISCELÁNEO
     ========================= */

  it('returns a deterministic color for a subject', () => {
    expect(component.obtenerColorMateria('INF-101')).toBe(
      component.obtenerColorMateria('inf-101')
    );
    expect(component.obtenerColorMateria('INF-101')).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('keeps a maximum of 4 subjects per page', () => {
    expect(component.materiasPorPagina).toBe(4);
  });

  it('localizes the add modal in both languages', () => {
    const languageService = TestBed.inject(LanguageService);

    component.abrirModalAgregar();
    languageService.setLanguage('en');
    fixture.detectChanges();

    let texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).toContain(HORARIOS_MESSAGES_EN.SIGLA);
    expect(texto).toContain(HORARIOS_MESSAGES_EN.TEACHER);
    expect(texto).toContain(HORARIOS_MESSAGES_EN.SEND_SUBJECTS);
    expect(texto).toContain(HORARIOS_MESSAGES_EN.SUBJECTS_TO_SEND_EMPTY);

    languageService.setLanguage('es');
    fixture.detectChanges();

    texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).toContain(HORARIOS_MESSAGES.SIGLA);
    expect(texto).toContain(HORARIOS_MESSAGES.TEACHER);
    expect(texto).toContain(HORARIOS_MESSAGES.SEND_SUBJECTS);
  });
});
