import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { MateriasTreeComponent } from './materias-tree.component';
import { MATERIAS_TREE_MESSAGES } from '../../../../strings/materias-tree/materias-tree.messages';

describe('MateriasTreeComponent', () => {
  let component: MateriasTreeComponent;
  let fixture: ComponentFixture<MateriasTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriasTreeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MateriasTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar las materias del árbol', () => {
    expect(component.materias.length).toBeGreaterThan(0);
  });

  it('debería generar un layout con nodos y dimensiones válidas', () => {
    expect(component.layout.nodes.length).toBe(component.materias.length);
    expect(component.layout.width).toBeGreaterThan(0);
    expect(component.layout.height).toBeGreaterThan(0);
    expect(component.layout.levels).toBeGreaterThan(0);
  });

  it('debería cargar correctamente los mensajes del componente', () => {
    expect(component.mensajes).toBe(MATERIAS_TREE_MESSAGES);
    expect(component.mensajes.ARIA_LABEL).toBe(
      'Malla curricular de materias'
    );
  });

  it('debería seleccionar una materia', () => {
    const materia = component.materias[0];

    component.selectMateria(materia.sigla);

    expect(component.selectedSigla()).toBe(materia.sigla);
  });

  it('debería quitar la selección al seleccionar nuevamente la misma materia', () => {
    const materia = component.materias[0];

    component.selectMateria(materia.sigla);
    component.selectMateria(materia.sigla);

    expect(component.selectedSigla()).toBeNull();
  });

  it('debería limpiar la selección', () => {
    const materia = component.materias[0];

    component.selectMateria(materia.sigla);
    component.clearSelection();

    expect(component.selectedSigla()).toBeNull();
  });

  it('debería aumentar el zoom', () => {
    const zoomInicial = component.zoom();

    component.zoomIn();

    expect(component.zoom()).toBeCloseTo(zoomInicial + 0.1);
  });

  it('debería disminuir el zoom', () => {
    component.resetZoom();
    const zoomInicial = component.zoom();

    component.zoomOut();

    expect(component.zoom()).toBeCloseTo(zoomInicial - 0.1);
  });

  it('debería restablecer el zoom', () => {
    component.zoomIn();
    component.zoomIn();

    component.resetZoom();

    expect(component.zoom()).toBe(1);
  });

  it('no debería permitir que el zoom supere el máximo establecido', () => {
    for (let i = 0; i < 10; i++) {
      component.zoomIn();
    }

    expect(component.zoom()).toBe(1.35);
  });

  it('no debería permitir que el zoom baje del mínimo establecido', () => {
    for (let i = 0; i < 10; i++) {
      component.zoomOut();
    }

    expect(component.zoom()).toBe(0.7);
  });

  it('debería identificar correctamente una materia resaltada', () => {
    const materia = component.layout.nodes[0];

    expect(component.isNodeHighlighted(materia)).toBe(true);
  });

  it('debería identificar las conexiones relacionadas con una materia seleccionada', () => {
    const connection = component.layout.connections[0];

    if (!connection) {
      return;
    }

    component.selectMateria(connection.fromSigla);

    expect(component.isConnectionHighlighted(connection)).toBe(true);
  });

  it('debería devolver la sigla de la materia como identificador', () => {
    const materia = component.layout.nodes[0];

    expect(component.trackBySigla(0, materia)).toBe(materia.sigla);
  });
});