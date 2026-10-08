import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosComponent } from './horarios.component';
import { HORARIOS_MESSAGES } from '../../strings/horarios/horarios.messages';

describe('HorariosComponent', () => {
  let component: HorariosComponent;
  let fixture: ComponentFixture<HorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosComponent],
    }).compileComponents();

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

  it('should display the semester subjects title', () => {
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