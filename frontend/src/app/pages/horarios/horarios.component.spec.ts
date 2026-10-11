import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosComponent } from './horarios.component';
import { HORARIOS_MESSAGES } from '../../strings/horarios/horarios.messages';
import { HORARIOS_MESSAGES as HORARIOS_MESSAGES_EN } from '../../strings/horarios/horarios-ingles.messages';
import { LanguageService } from '../../services/language.service';

describe('HorariosComponent', () => {
  let component: HorariosComponent;
  let fixture: ComponentFixture<HorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosComponent],
    }).compileComponents();

    TestBed.inject(LanguageService).setLanguage('es');
    fixture = TestBed.createComponent(HorariosComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 subjects in the schedule data', () => {
    expect(component.materias.length).toBe(4);
  });

  it('should have Programación I selected by default', () => {
    const programacion = component.materias.find(
      materia => materia.codigo === 'INF-101'
    );

    expect(programacion).toBeTruthy();
    expect(programacion?.seleccionada).toBe(true);
  });

  it('should have the correct number of schedule options', () => {
    const programacion = component.materias.find(
      materia => materia.codigo === 'INF-101'
    );

    const ingenieria = component.materias.find(
      materia => materia.codigo === 'INF-410'
    );

    expect(programacion?.opciones.length).toBe(2);
    expect(ingenieria?.opciones.length).toBe(1);
  });

  it('should display the semester subjects title in Spanish', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      HORARIOS_MESSAGES.SEMESTER_SUBJECTS
    );
  });

  it('should display all subjects in the page', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Programación I');
    expect(compiled.textContent).toContain('Estructuras de Datos');
    expect(compiled.textContent).toContain('Bases de Datos');
    expect(compiled.textContent).toContain('Ingeniería de Software');
  });

  it('switches schedule labels and weekdays in both directions', () => {
    const languageService = TestBed.inject(LanguageService);
    const materia = component.materias[0];
    const horario = materia.opciones[0].horario;

    languageService.setLanguage('en');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain(HORARIOS_MESSAGES_EN.SEMESTER_SUBJECTS);
    expect(fixture.nativeElement.textContent).toContain('Programming I');
    expect(fixture.nativeElement.textContent).toContain('Data Structures');
    expect(fixture.nativeElement.textContent)
      .toContain(HORARIOS_MESSAGES_EN.OPTION_LABEL);
    expect(component.dias[0]).toBe('Monday');
    expect(component.obtenerHorarioVisible(horario)).toContain('Monday');
    expect(component.obtenerBloquesMateria(materia, 'Monday').length)
      .toBeGreaterThan(0);

    languageService.setLanguage('es');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain(HORARIOS_MESSAGES.SEMESTER_SUBJECTS);
    expect(fixture.nativeElement.textContent).toContain('Programación I');
    expect(fixture.nativeElement.textContent).toContain('Estructuras de Datos');
    expect(component.dias[0]).toBe('Lunes');
    expect(component.obtenerHorarioVisible(horario)).toContain('Lunes');
    expect(component.obtenerBloquesMateria(materia, 'Lunes').length)
      .toBeGreaterThan(0);
  });

  it('translates available-subject names in the add modal with the active language', () => {
    const languageService = TestBed.inject(LanguageService);
    component.abrirModalAgregar();

    languageService.setLanguage('en');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.modal-materia strong')?.textContent?.trim()
    ).toBe('Linear Algebra');

    languageService.setLanguage('es');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.modal-materia strong')?.textContent?.trim()
    ).toBe('Álgebra lineal');

    component.cerrarModalAgregar();
    fixture.detectChanges();
  });

  it('localizes schedule actions, modal content, and aria labels in both languages', () => {
    const languageService = TestBed.inject(LanguageService);
    const ingles = fixture.nativeElement as HTMLElement;

    languageService.setLanguage('en');
    fixture.detectChanges();

    expect(ingles.textContent).toContain('Planning');
    expect(ingles.textContent).toContain('Add subject');
    expect(ingles.textContent).toContain('Download schedule');
    expect(ingles.querySelector('[aria-label="Previous page of subjects"]'))
      .not.toBeNull();
    expect(ingles.querySelector('[aria-label="Next page of subjects"]'))
      .not.toBeNull();

    fixture.nativeElement.querySelector('.header-actions .btn-agregar').click();
    fixture.detectChanges();
    expect(component.modalAgregarAbierto).toBe(true);
    expect(ingles.textContent).toContain('Semester');
    expect(ingles.textContent).toContain('Cancel');
    expect(ingles.textContent).toContain('Add selected');
    expect(ingles.querySelector('.modal-cerrar')?.getAttribute('aria-label'))
      .toBe('Close dialog');

    fixture.nativeElement.querySelector('.modal-footer .btn-cancelar').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.header-actions .btn-descargar').click();
    fixture.detectChanges();
    expect(ingles.textContent).toContain('Planning');
    expect(ingles.textContent).toContain('Download schedule');
    expect(ingles.textContent).toContain('Confirm');
    expect(ingles.textContent).not.toContain('Planificación');
    expect(ingles.textContent).not.toContain('Cancelar');

    languageService.setLanguage('es');
    fixture.detectChanges();
    expect(ingles.textContent).toContain('Planificación');
    expect(ingles.textContent).toContain('Confirmar');
    expect(ingles.querySelector('.modal-cerrar')?.getAttribute('aria-label'))
      .toBe('Cerrar modal');
  });

  it('should initialize pagination based on selected subjects', () => {
    expect(component.totalHorarios).toBe(2);
    expect(component.paginaActual).toBe(1);
  });

  it('should move to the next page', () => {
    component.siguiente();

    expect(component.paginaActual).toBe(2);
  });

  it('should not move past the last page', () => {
    component.paginaActual = component.totalHorarios;

    component.siguiente();

    expect(component.paginaActual).toBe(component.totalHorarios);
  });

  it('should move to the previous page', () => {
    component.paginaActual = 2;

    component.anterior();

    expect(component.paginaActual).toBe(1);
  });

  it('should not move before the first page', () => {
    component.paginaActual = 1;

    component.anterior();

    expect(component.paginaActual).toBe(1);
  });

  it('should update the number of pages when selecting a subject', () => {
    const ingenieria = component.materias.find(
      materia => materia.codigo === 'INF-410'
    );

    expect(ingenieria).toBeTruthy();

    component.seleccionarMateria(ingenieria!);

    expect(component.totalHorarios).toBe(2);
  });

  it('should add a subject when it is selected', () => {
    const estructuras = component.materias.find(
      materia => materia.codigo === 'INF-202'
    );

    expect(estructuras).toBeTruthy();

    component.seleccionarMateria(estructuras!);

    expect(estructuras?.seleccionada).toBe(true);
    expect(
      component.materiasSeleccionadas.some(
        materia => materia.codigo === 'INF-202'
      )
    ).toBe(true);
  });

  it('should remove a subject when it is unselected', () => {
    const programacion = component.materias.find(
      materia => materia.codigo === 'INF-101'
    );

    expect(programacion).toBeTruthy();

    component.seleccionarMateria(programacion!);

    expect(programacion?.seleccionada).toBe(false);
    expect(
      component.materiasSeleccionadas.some(
        materia => materia.codigo === 'INF-101'
      )
    ).toBe(false);
  });

  it('should have no schedule pages when no subjects are selected', () => {
    component.materias
      .filter(materia => materia.seleccionada)
      .forEach(materia => component.seleccionarMateria(materia));

    expect(component.totalHorarios).toBe(0);
    expect(component.hayHorarios).toBe(false);
  });

  it('should detect a subject in its correct schedule', () => {
    const estructuras = component.materias.find(
      materia => materia.codigo === 'INF-202'
    );

    expect(estructuras).toBeTruthy();

    const estaEnMartes = component.estaMateriaEnHorario(
      estructuras!,
      'Martes',
      '09:30'
    );

    expect(estaEnMartes).toBe(true);
  });

  it('should not detect a subject outside its schedule', () => {
    const estructuras = component.materias.find(
      materia => materia.codigo === 'INF-202'
    );

    expect(estructuras).toBeTruthy();

    const estaEnLunes = component.estaMateriaEnHorario(
      estructuras!,
      'Lunes',
      '09:30'
    );

    expect(estaEnLunes).toBe(false);
  });

  it('should return a color for a subject', () => {
    const color = component.obtenerColorMateria('INF-202');

    expect(color).toBe('#2e7d5b');
  });

  it('should display a maximum of 4 subjects per page', () => {
    expect(component.materiasPorPagina).toBe(4);
    expect(component.materiasPaginadas.length).toBeLessThanOrEqual(4);
  });

  it('should calculate the number of subject pages', () => {
    const materiasOriginales = component.materias.length;

    component.materias.push(
      {
        codigo: 'TEST-001',
        nombre: 'Materia de prueba 1',
        seleccionada: false,
        opciones: []
      },
      {
        codigo: 'TEST-002',
        nombre: 'Materia de prueba 2',
        seleccionada: false,
        opciones: []
      }
    );

    expect(component.totalPaginasMaterias).toBe(
      Math.ceil((materiasOriginales + 2) / 4)
    );

    component.materias.splice(materiasOriginales, 2);
  });

  it('should show the next page of subjects', () => {
    const materiasOriginales = component.materias.length;

    component.materias.push(
      {
        codigo: 'TEST-001',
        nombre: 'Materia de prueba 1',
        seleccionada: false,
        opciones: []
      },
      {
        codigo: 'TEST-002',
        nombre: 'Materia de prueba 2',
        seleccionada: false,
        opciones: []
      }
    );

    component.siguienteMaterias();

    expect(component.paginaMaterias).toBe(2);
    expect(component.materiasPaginadas.length).toBe(2);

    component.materias.splice(materiasOriginales, 2);
    component.paginaMaterias = 1;
  });

  it('should not move past the last page of subjects', () => {
    component.paginaMaterias = component.totalPaginasMaterias;

    component.siguienteMaterias();

    expect(component.paginaMaterias).toBe(
      component.totalPaginasMaterias
    );
  });

  it('should not move before the first page of subjects', () => {
    component.paginaMaterias = 1;

    component.anteriorMaterias();

    expect(component.paginaMaterias).toBe(1);
  });

  it('should open and close the add subject modal', () => {
    component.abrirModalAgregar();

    expect(component.modalAgregarAbierto).toBe(true);

    component.cerrarModalAgregar();

    expect(component.modalAgregarAbierto).toBe(false);
  });

  it('should open and close the download modal', () => {
    component.abrirModalDescargar();

    expect(component.modalDescargarAbierto).toBe(true);

    component.cerrarModalDescargar();

    expect(component.modalDescargarAbierto).toBe(false);
  });
});