import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageService } from '../../../../../services/language.service';
import { MESSAGES } from '../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../strings/materias/materias-ingles.messages';
import { MaterialAcademico, MaterialesComponent } from './materiales.component';

const MATERIALES: MaterialAcademico[] = [
  {
    id: 'm1', titulo: 'Parcial resuelto', descripcion: 'Soluciones del parcial.',
    docente: { id: 'd1', nombre: 'Ana Pérez' },
    semestre: { id: '2026-1', etiqueta: '2026-1' },
    tipo: { id: 'examen', etiqueta: 'Examen', etiquetaEn: 'Exam' }
  },
  {
    id: 'm2', titulo: 'Guía de ejercicios', descripcion: 'Ejercicios prácticos.',
    docente: { id: 'd2', nombre: 'Luis Rojas' },
    semestre: { id: '2025-2', etiqueta: '2025-2' },
    tipo: { id: 'guia', etiqueta: 'Guía', etiquetaEn: 'Guide' }
  },
  {
    id: 'm3', titulo: 'Segundo parcial', descripcion: 'Evaluación de unidad.',
    docente: { id: 'd1', nombre: 'Ana Pérez' },
    semestre: { id: '2026-1', etiqueta: '2026-1' },
    tipo: { id: 'examen', etiqueta: 'Examen', etiquetaEn: 'Exam' }
  }
];

describe('MaterialesComponent', () => {
  let fixture: ComponentFixture<MaterialesComponent>;
  let language: LanguageService;

  const titulos = () => Array.from(
    fixture.nativeElement.querySelectorAll('.material-card h2'),
    (heading: Element) => heading.textContent?.trim()
  );

  const seleccionar = (id: string, value: string) => {
    const select = fixture.nativeElement.querySelector(`#${id}`) as HTMLSelectElement;
    select.value = value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MaterialesComponent] }).compileComponents();
    language = TestBed.inject(LanguageService);
    language.setLanguage('es');
    fixture = TestBed.createComponent(MaterialesComponent);
    fixture.componentRef.setInput('materiales', MATERIALES);
    fixture.detectChanges();
  });

  it('inicia con Todos y muestra el catálogo recibido', () => {
    const selects = fixture.nativeElement.querySelectorAll('select');
    expect(Array.from(selects, (select: HTMLSelectElement) => select.value)).toEqual(['', '', '']);
    expect(titulos()).toEqual(['Parcial resuelto', 'Guía de ejercicios', 'Segundo parcial']);
  });

  it('filtra por docente', () => {
    seleccionar('material-docente', 'd2');
    expect(titulos()).toEqual(['Guía de ejercicios']);
  });

  it('filtra por semestre', () => {
    seleccionar('material-semestre', '2025-2');
    expect(titulos()).toEqual(['Guía de ejercicios']);
  });

  it('filtra por tipo', () => {
    seleccionar('material-tipo', 'guia');
    expect(titulos()).toEqual(['Guía de ejercicios']);
  });

  it('combina los tres criterios con Y', () => {
    seleccionar('material-docente', 'd1');
    seleccionar('material-semestre', '2026-1');
    seleccionar('material-tipo', 'examen');
    expect(titulos()).toEqual(['Parcial resuelto', 'Segundo parcial']);
  });

  it('restablece solo el criterio que vuelve a Todos', () => {
    seleccionar('material-docente', 'd1');
    seleccionar('material-tipo', 'examen');
    seleccionar('material-docente', '');
    expect(titulos()).toEqual(['Parcial resuelto', 'Segundo parcial']);
    expect((fixture.nativeElement.querySelector('#material-tipo') as HTMLSelectElement).value).toBe('examen');
  });

  it('muestra un estado distinto cuando no hay coincidencias', () => {
    seleccionar('material-docente', 'd2');
    seleccionar('material-semestre', '2026-1');
    expect(titulos()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_NO_MATCHES);
  });

  it('cambia ES a EN y conserva las selecciones', () => {
    seleccionar('material-docente', 'd1');
    seleccionar('material-tipo', 'examen');
    language.setLanguage('en');
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('#material-docente') as HTMLSelectElement).value).toBe('d1');
    expect(fixture.nativeElement.textContent).toContain(MESSAGES_EN.MATERIAL_TEACHER_FILTER);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES_EN.MATERIAL_FILTER_ALL);
    expect(fixture.nativeElement.textContent).toContain('Exam');
    expect((fixture.nativeElement.querySelector('#material-tipo') as HTMLSelectElement).value).toBe('examen');
    expect(titulos()).toEqual(['Parcial resuelto', 'Segundo parcial']);
  });
});
