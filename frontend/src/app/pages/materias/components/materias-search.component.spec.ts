import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Materia } from '../../../models/materia';
import { APP_CONFIG } from '../../../config/app-config';
import { MateriasComponent } from '../materias.component';

describe('HU-02: buscar materia por nombre mediante el backend', () => {
  let fixture: ComponentFixture<MateriasComponent>;
  let http: HttpTestingController;
  const endpoint = 'http://localhost:8081/api/materias';
  const config = APP_CONFIG as { DEMO_MODE: boolean };
  const originalDemoMode = config.DEMO_MODE;
  const materias: Materia[] = [
    { id: 11, codigo: 'INF-101', nombre: 'Programación I', carrera: 'Ingeniería de Sistemas', semestre: 1 },
    { id: 25, codigo: 'MAT-102', nombre: 'Matemática II', carrera: 'Ingeniería Civil', semestre: 2 }
  ];

  beforeEach(async () => {
    config.DEMO_MODE = false;
    await TestBed.configureTestingModule({
      imports: [MateriasComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    vi.useFakeTimers();
    fixture = TestBed.createComponent(MateriasComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    http.verify();
    vi.useRealTimers();
    config.DEMO_MODE = originalDemoMode;
  });

  function escribir(termino: string): void {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="search"]');
    input.value = termino;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  async function esperarBusqueda(): Promise<void> {
    await vi.advanceTimersByTimeAsync(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
    if (!fixture.componentRef.hostView.destroyed) fixture.detectChanges();
  }

  function responderCatalogo(): void {
    http.expectOne(endpoint).flush(materias);
    fixture.detectChanges();
  }

  function peticionNombre(nombre: string) {
    return http.expectOne(req => req.method === 'GET' && req.url === endpoint &&
      req.params.get('nombre') === nombre && req.params.keys().length === 1);
  }

  function codigosVisibles(): string[] {
    const elementos: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.materia-card__codigo');
    return Array.from(elementos, element => element.textContent!.trim());
  }

  it.each(['Programación I', 'progra', 'pROGRAMACIÓN', '  Programación  '])(
    'envía "%s" como nombre y presenta la respuesta del backend', async termino => {
      responderCatalogo();
      escribir(termino);
      expect(fixture.nativeElement.textContent).toContain('Cargando materias');
      await esperarBusqueda();
      peticionNombre(termino.trim()).flush([materias[0]]);
      fixture.detectChanges();
      expect(codigosVisibles()).toEqual(['INF-101']);
      expect(fixture.nativeElement.querySelector('.materias-page__total').textContent)
        .toMatch(/1\s+materia encontrada/);
    }
  );

  it('no busca códigos localmente ni sustituye la respuesta vacía por datos demo', async () => {
    config.DEMO_MODE = true;
    responderCatalogo();
    escribir('INF-101');
    await esperarBusqueda();
    peticionNombre('INF-101').flush([]);
    fixture.detectChanges();
    expect(codigosVisibles()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No se encontraron coincidencias');
    expect(fixture.nativeElement.querySelector('.materias-page__demo')).toBeNull();
    expect(fixture.nativeElement.querySelector('input').placeholder).toBe('Nombre de la materia');
  });

  it('consulta de nuevo el catálogo completo al limpiar y devuelve el foco al campo', async () => {
    responderCatalogo();
    escribir('Química');
    await esperarBusqueda();
    peticionNombre('Química').flush([]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.materias-search__clear').click();
    responderCatalogo();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);
    expect(codigosVisibles()).toEqual(['INF-101', 'MAT-102']);
    expect(fixture.nativeElement.querySelector('.materias-page__message')).toBeNull();
  });

  it.each(['borrar', 'Escape', 'espacios'])('recupera el catálogo sin parámetros al usar %s', async accion => {
    responderCatalogo();
    escribir('Mat');
    await esperarBusqueda();
    peticionNombre('Mat').flush([materias[1]]);
    fixture.detectChanges();
    if (accion === 'Escape') {
      fixture.nativeElement.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    } else {
      escribir(accion === 'espacios' ? '   ' : '');
    }
    responderCatalogo();
    expect(codigosVisibles()).toEqual(['INF-101', 'MAT-102']);
  });

  it('agrupa pulsaciones rápidas en una sola consulta con el último nombre', async () => {
    responderCatalogo();
    escribir('P');
    await vi.advanceTimersByTimeAsync(150);
    escribir('Pro');
    await vi.advanceTimersByTimeAsync(150);
    http.expectNone(() => true);
    await esperarBusqueda();
    peticionNombre('Pro').flush([materias[0]]);
    fixture.detectChanges();
    expect(codigosVisibles()).toEqual(['INF-101']);
  });

  it('cancela la carga inicial y las búsquedas anteriores cuando cambia el nombre', async () => {
    const inicial = http.expectOne(endpoint);
    escribir('Pro');
    expect(inicial.cancelled).toBe(true);
    await esperarBusqueda();
    const anterior = peticionNombre('Pro');
    escribir('Mat');
    expect(anterior.cancelled).toBe(true);
    await esperarBusqueda();
    peticionNombre('Mat').flush([materias[1]]);
    fixture.detectChanges();
    expect(codigosVisibles()).toEqual(['MAT-102']);
  });

  it('cancela la búsqueda en curso al limpiar', async () => {
    responderCatalogo();
    escribir('Pro');
    await esperarBusqueda();
    const anterior = peticionNombre('Pro');
    fixture.nativeElement.querySelector('.materias-search__clear').click();
    expect(anterior.cancelled).toBe(true);
    responderCatalogo();
    expect(codigosVisibles()).toEqual(['INF-101', 'MAT-102']);
  });

  it('muestra el error de búsqueda y reintenta con el mismo nombre sin datos demo', async () => {
    config.DEMO_MODE = true;
    responderCatalogo();
    escribir('Mat');
    await esperarBusqueda();
    peticionNombre('Mat').flush('Error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('No pudimos cargar las materias');
    expect(fixture.nativeElement.textContent).not.toContain('No se encontraron coincidencias');
    fixture.nativeElement.querySelector('[role="alert"] button').click();
    peticionNombre('Mat').flush([materias[1]]);
    fixture.detectChanges();
    expect(codigosVisibles()).toEqual(['MAT-102']);
  });

  it('cancela la espera al abandonar la pantalla', async () => {
    responderCatalogo();
    escribir('Pro');
    fixture.destroy();
    await esperarBusqueda();
    http.expectNone(() => true);
  });
});
