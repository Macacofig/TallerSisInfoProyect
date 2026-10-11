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

  it('should display the semester subjects title in English', () => {
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
});