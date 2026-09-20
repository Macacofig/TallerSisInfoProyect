import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { Materia } from '../../../models/materia';
import { ApiService } from '../../../services/api';
import { APP_CONFIG } from '../../../config/app-config';
import { MateriasComponent } from '../materias.component';

describe('catálogo: normalización, presentación y paginación', () => {
  let fixture: ComponentFixture<MateriasComponent>;
  let api: {
    obtenerMaterias: ReturnType<typeof vi.fn>;
    obtenerCarreras: ReturnType<typeof vi.fn>;
  };

  const sistemas = 'Ingeniería de Sistemas';
  const materias: Materia[] = Array.from({ length: 25 }, (_, indice) => ({
    id: indice + 1,
    codigo: `MAT-${indice + 1}`,
    nombre: indice < 15 ? `programacion ${indice + 1}` : `algebra lineal ${indice + 1}`,
    carrera: indice < 20 ? sistemas : 'Ingeniería Civil',
    semestre: 1,
  }));

  beforeEach(async () => {
    vi.useFakeTimers();
    api = {
      obtenerMaterias: vi.fn((): Observable<Materia[]> => of(materias)),
      obtenerCarreras: vi.fn((): Observable<string[]> => of([
        sistemas, '', ' ingenieria de sistemas ', 'Ingeniería Civil'
      ])),
    };
    await TestBed.configureTestingModule({
      imports: [MateriasComponent],
      providers: [provideRouter([]), { provide: ApiService, useValue: api }],
    }).compileComponents();
    fixture = TestBed.createComponent(MateriasComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  function tarjetas(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('.materia-card');
  }

  it('carga carreras desde ApiService y muestra solo valores únicos, no vacíos y ordenados', () => {
    expect(api.obtenerCarreras).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.carreras()).toEqual(['Ingeniería Civil', sistemas]);
  });

  it('muestra solo 12 materias en la primera página y permite avanzar y retroceder', () => {
    expect(tarjetas()).toHaveLength(APP_CONFIG.PAGINATION.PAGE_SIZE);
    expect(tarjetas()[0].textContent).toContain('MAT-1');

    (fixture.nativeElement.querySelector('[aria-label="Siguiente"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.paginaActual()).toBe(2);
    expect(tarjetas()).toHaveLength(12);
    expect(tarjetas()[0].textContent).toContain('MAT-13');

    (fixture.nativeElement.querySelector('[aria-label="Anterior"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.paginaActual()).toBe(1);
    expect(tarjetas()[0].textContent).toContain('MAT-1');
  });

  it('reinicia la página al cambiar búsqueda o carrera', async () => {
    fixture.componentInstance.cambiarPagina(2);
    fixture.componentInstance.actualizarBusqueda('PROGRAMACIÓN');
    expect(fixture.componentInstance.paginaActual()).toBe(1);
    await vi.advanceTimersByTimeAsync(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);

    fixture.componentInstance.cambiarPagina(2);
    fixture.componentInstance.actualizarCarrera('Ingeniería Civil');
    expect(fixture.componentInstance.paginaActual()).toBe(1);
  });

  it('combina búsqueda sin tilde, carrera y paginación', async () => {
    fixture.componentInstance.actualizarCarrera(sistemas);
    fixture.componentInstance.actualizarBusqueda('  PROGRAMACION  ');
    await vi.advanceTimersByTimeAsync(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
    fixture.detectChanges();

    expect(fixture.componentInstance.materias()).toHaveLength(15);
    expect(tarjetas()).toHaveLength(12);
    fixture.componentInstance.cambiarPagina(2);
    fixture.detectChanges();
    expect(tarjetas()).toHaveLength(3);
    expect(fixture.nativeElement.querySelector('.materias-pagination__status').textContent)
      .toMatch(/Página\s+2\s+de\s+2/);
  });

  it('presenta nombres corregidos sin cambiar los datos originales', () => {
    expect(tarjetas()[0].querySelector('h2')?.textContent).toBe('Programación 1');
    expect(fixture.componentInstance.materias()[0].nombre).toBe('programacion 1');
  });

  it('mantiene operativo el catálogo cuando falla la carga de carreras', () => {
    api.obtenerCarreras.mockReturnValue(throwError(() => new Error('sin conexión')));
    fixture.componentInstance.cargarCarreras();
    fixture.detectChanges();

    expect(fixture.componentInstance.estadoCarreras()).toBe(APP_CONFIG.COMPONENT_STATES.ERROR);
    expect(tarjetas()).toHaveLength(12);
  });
});
