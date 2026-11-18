import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { MaterialResponse } from '../../../../../models/material.model';
import { ApiService } from '../../../../../services/api';
import { LanguageService } from '../../../../../services/language.service';
import { MESSAGES } from '../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../strings/materias/materias-ingles.messages';
import { MaterialesComponent } from './materiales.component';

const ID_MATERIA = 42;

type FiltrosMaterial = { idDocente?: number; semestre?: number; tipo?: string };

const MATERIALES: MaterialResponse[] = [
  {
    id: 1, linkMaterial: 'pruebas/1.pdf', titulo: 'Parcial resuelto',
    descripcion: 'Soluciones del parcial.', tipo: 'PDF', idMateria: ID_MATERIA,
    nombreMateria: 'Materia de prueba', idDocente: 1, nombreDocente: 'Ana Pérez',
    semestreIngresado: 1, estado: 'ACTIVO'
  },
  {
    id: 2, linkMaterial: 'pruebas/2.docx', titulo: 'Guía de ejercicios',
    descripcion: 'Ejercicios prácticos.', tipo: 'WORD', idMateria: ID_MATERIA,
    nombreMateria: 'Materia de prueba', idDocente: 2, nombreDocente: 'Luis Rojas',
    semestreIngresado: 2, estado: 'ACTIVO'
  },
  {
    id: 3, linkMaterial: 'pruebas/3.pdf', titulo: 'Segundo parcial',
    descripcion: 'Evaluación de unidad.', tipo: 'PDF', idMateria: ID_MATERIA,
    nombreMateria: 'Materia de prueba', idDocente: 1, nombreDocente: 'Ana Pérez',
    semestreIngresado: 1, estado: 'ACTIVO'
  },
  {
    id: 4, linkMaterial: 'pruebas/4.png', titulo: 'Diagrama de apoyo',
    descripcion: 'Imagen de referencia.', tipo: 'IMAGEN', idMateria: ID_MATERIA,
    nombreMateria: 'Materia de prueba', idDocente: 1, nombreDocente: 'Ana Pérez',
    semestreIngresado: 2, estado: 'ACTIVO'
  }
];

const api = {
  obtenerMateriales: vi.fn((idMateria: number, filtros: FiltrosMaterial = {}) =>
    of(MATERIALES.filter(material =>
      material.idMateria === idMateria &&
      (filtros.idDocente == null || material.idDocente === filtros.idDocente) &&
      (filtros.semestre == null || material.semestreIngresado === filtros.semestre) &&
      (!filtros.tipo || material.tipo === filtros.tipo)
    ))
  )
};

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
    api.obtenerMateriales.mockClear();
    await TestBed.configureTestingModule({
      imports: [MaterialesComponent],
      providers: [{ provide: ApiService, useValue: api }]
    }).compileComponents();

    language = TestBed.inject(LanguageService);
    language.setLanguage('es');
    fixture = TestBed.createComponent(MaterialesComponent);
    fixture.componentRef.setInput('idMateria', ID_MATERIA);
    fixture.detectChanges();
  });

  afterEach(() => language.setLanguage('es'));

  it('inicia con Todos y muestra el catálogo recibido de la materia', () => {
    const selects = fixture.nativeElement.querySelectorAll('select');
    expect(Array.from(selects, (select: HTMLSelectElement) => select.value)).toEqual(['', '', '']);
    expect(titulos()).toEqual([
      'Parcial resuelto', 'Guía de ejercicios', 'Segundo parcial', 'Diagrama de apoyo'
    ]);
    expect(api.obtenerMateriales).toHaveBeenCalledWith(ID_MATERIA, {});
  });

  it('filtra por docente', () => {
    seleccionar('material-docente', '2');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(ID_MATERIA, { idDocente: 2 });
    expect(titulos()).toEqual(['Guía de ejercicios']);
  });

  it('filtra por semestre', () => {
    seleccionar('material-semestre', '2');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(ID_MATERIA, { semestre: 2 });
    expect(titulos()).toEqual(['Guía de ejercicios', 'Diagrama de apoyo']);
  });

  it('filtra por tipo', () => {
    seleccionar('material-tipo', 'WORD');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(ID_MATERIA, { tipo: 'WORD' });
    expect(titulos()).toEqual(['Guía de ejercicios']);
  });

  it('combina los tres criterios con Y', () => {
    seleccionar('material-docente', '1');
    seleccionar('material-semestre', '1');
    seleccionar('material-tipo', 'PDF');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(
      ID_MATERIA, { idDocente: 1, semestre: 1, tipo: 'PDF' }
    );
    expect(titulos()).toEqual(['Parcial resuelto', 'Segundo parcial']);
  });

  it('restablece solo el criterio que vuelve a Todos', () => {
    seleccionar('material-docente', '1');
    seleccionar('material-tipo', 'PDF');
    seleccionar('material-docente', '');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(ID_MATERIA, { tipo: 'PDF' });
    expect(titulos()).toEqual(['Parcial resuelto', 'Segundo parcial']);
    expect((fixture.nativeElement.querySelector('#material-tipo') as HTMLSelectElement).value).toBe('PDF');
  });

  it('muestra un estado distinto cuando no hay coincidencias', () => {
    seleccionar('material-docente', '2');
    seleccionar('material-semestre', '1');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(
      ID_MATERIA, { idDocente: 2, semestre: 1 }
    );
    expect(titulos()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_NO_MATCHES);
  });

  it('cambia ES a EN y conserva las selecciones', () => {
    seleccionar('material-docente', '1');
    seleccionar('material-tipo', 'IMAGEN');
    language.setLanguage('en');
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('#material-docente') as HTMLSelectElement).value).toBe('1');
    expect(fixture.nativeElement.textContent).toContain(MESSAGES_EN.MATERIAL_TEACHER_FILTER);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES_EN.MATERIAL_FILTER_ALL);
    expect(fixture.nativeElement.textContent).toContain('Image');
    expect((fixture.nativeElement.querySelector('#material-tipo') as HTMLSelectElement).value).toBe('IMAGEN');
    expect(titulos()).toEqual(['Diagrama de apoyo']);
  });
});
