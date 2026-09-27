import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CalificacionMateriaPromedioResponse } from '../../../../../../models/calificacion-materia.model';
import { CalificacionesMateriaService } from '../../../../../../services/calificaciones-materia.service';
import { FiltroGestionesComponent } from './filtro-gestiones.component';

describe('FiltroGestionesComponent', () => {
  let fixture: ComponentFixture<FiltroGestionesComponent>;

  const respuestaPorGestion: Record<string, CalificacionMateriaPromedioResponse> = {
    '2026-I': {
      idMateria: null,
      gestionDesde: '2026-I',
      gestionHasta: '2026-I',
      dificultadPromedio: 7,
      cargaPromedio: 8,
      conocimientoPrevioPromedio: 8
    },
    '2025-II': {
      idMateria: null,
      gestionDesde: '2025-II',
      gestionHasta: '2025-II',
      dificultadPromedio: 6.5,
      cargaPromedio: 7,
      conocimientoPrevioPromedio: 5.5
    }
  };

  const calificacionesMateriaServiceMock = {
    obtenerPromediosPorGestion: vi.fn((gestion: string) =>
      of(respuestaPorGestion[gestion])
    ),
    obtenerPromediosPorRango: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [FiltroGestionesComponent],
      providers: [
        {
          provide: CalificacionesMateriaService,
          useValue: calificacionesMateriaServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltroGestionesComponent);
    fixture.componentRef.setInput('gestiones', ['2025-II', '2026-I']);
    fixture.componentRef.setInput('gestionInicial', '2026-I');
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('consulta y emite los indicadores cada vez que cambia el selector', () => {
    const resultados: CalificacionMateriaPromedioResponse[] = [];
    fixture.componentInstance.filtroAplicado.subscribe(
      ({ promedios }) => {
        if (promedios) {
          resultados.push(promedios);
        }
      }
    );

    fixture.detectChanges();

    expect(calificacionesMateriaServiceMock.obtenerPromediosPorGestion)
      .toHaveBeenLastCalledWith('2026-I');

    const selector =
      fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    selector.value = '2025-II';
    selector.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(calificacionesMateriaServiceMock.obtenerPromediosPorGestion)
      .toHaveBeenLastCalledWith('2025-II');
    expect(resultados.at(-1)).toEqual(respuestaPorGestion['2025-II']);
    expect(resultados.at(-1)?.dificultadPromedio).toBe(6.5);
    expect(resultados.at(-1)?.cargaPromedio).toBe(7);
    expect(resultados.at(-1)?.conocimientoPrevioPromedio).toBe(5.5);
  });
});