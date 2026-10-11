import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  CalificacionMateriaPromedioResponse
} from '../../../../../models/calificacion-materia.model';

import {
  LanguageService
} from '../../../../../services/language.service';

import {
  MESSAGES
} from '../../../../../strings/calificacion-graficos/calificacion-graficos.messages';

import {
  MESSAGES_EN
} from '../../../../../strings/calificacion-graficos/calificacion-graficos-ingles.messages';

import {
  CalificacionGraficosComponent
} from './calificacion-graficos.component';

describe('CalificacionGraficosComponent', () => {

  let component: CalificacionGraficosComponent;
  let fixture: ComponentFixture<CalificacionGraficosComponent>;

  const promedios =
    {
      dificultadPromedio: 7.5,
      cargaPromedio: 6.2,
      conocimientoPrevioPromedio: 8.1
    } as CalificacionMateriaPromedioResponse;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [
        CalificacionGraficosComponent
      ]
    }).compileComponents();

    TestBed.inject(LanguageService).setLanguage('es');
    fixture =
      TestBed.createComponent(
        CalificacionGraficosComponent
      );

    component =
      fixture.componentInstance;

    component.promedios =
      promedios;

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {

    expect(component).toBeTruthy();

  });

  it('debería cargar los mensajes del componente', () => {

    expect(component.mensajes).toBe(MESSAGES);

  });

  it('debería usar el contexto general por defecto', () => {

    expect(component.contextoVisible)
      .toBe(
        MESSAGES.CALIFICATION_SUMMARY_GENERAL_CONTEXT
      );

  });

  it('debería formatear el promedio con un decimal', () => {

    expect(
      component.obtenerPromedioFormateado(7.56)
    ).toBe('7.6');

  });

  it('debería convertir el promedio a porcentaje', () => {

    expect(
      component.obtenerPorcentaje(7.5)
    ).toBe(75);

  });

  it('no debería permitir porcentajes menores que cero', () => {

    expect(
      component.obtenerPorcentaje(-2)
    ).toBe(0);

  });

  it('no debería permitir porcentajes mayores que cien', () => {

    expect(
      component.obtenerPorcentaje(15)
    ).toBe(100);

  });

  it('debería mostrar el título y las métricas', () => {

    const html =
      fixture.nativeElement as HTMLElement;

    expect(html.textContent)
      .toContain(
        MESSAGES.CALIFICATION_GRAPH_TITLE
      );

    expect(html.textContent)
      .toContain(
        MESSAGES.CALIFICATION_DIFFICULTY_LABEL
      );

    expect(html.textContent)
      .toContain(
        MESSAGES.CALIFICATION_WORKLOAD_LABEL
      );

    expect(html.textContent)
      .toContain(
        MESSAGES.CALIFICATION_PREVIOUS_KNOWLEDGE_LABEL
      );

  });

  it('debería mostrar las etiquetas ARIA de las métricas', () => {

    const barras =
      fixture.nativeElement.querySelectorAll(
        '[role="progressbar"]'
      );

    expect(barras.length).toBe(3);

    expect(
      barras[0].getAttribute('aria-label')
    ).toBe(
      MESSAGES.CALIFICATION_GRAPH_DIFFICULTY_ARIA
    );

    expect(
      barras[1].getAttribute('aria-label')
    ).toBe(
      MESSAGES.CALIFICATION_GRAPH_WORKLOAD_ARIA
    );

    expect(
      barras[2].getAttribute('aria-label')
    ).toBe(
      MESSAGES.CALIFICATION_GRAPH_PREVIOUS_KNOWLEDGE_ARIA
    );

  });

  it('updates chart labels in English and back to Spanish', () => {
    const languageService = TestBed.inject(LanguageService);

    languageService.setLanguage('en');
    fixture.detectChanges();

    expect(component.mensajes.CALIFICATION_GRAPH_TITLE)
      .toBe(MESSAGES_EN.CALIFICATION_GRAPH_TITLE);
    expect(fixture.nativeElement.textContent)
      .toContain(MESSAGES_EN.CALIFICATION_GRAPH_TITLE);
    expect(component.contextoVisible)
      .toBe(MESSAGES_EN.CALIFICATION_SUMMARY_GENERAL_CONTEXT);

    languageService.setLanguage('es');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain(MESSAGES.CALIFICATION_GRAPH_TITLE);
    expect(component.contextoVisible)
      .toBe(MESSAGES.CALIFICATION_SUMMARY_GENERAL_CONTEXT);
  });

});