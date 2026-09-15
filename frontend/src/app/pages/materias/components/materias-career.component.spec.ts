import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Materia } from '../../../models/materia';
import { APP_CONFIG } from '../../../config/app-config';
import { MESSAGES } from '../../../strings/materias/materias.messages';
import { MateriasComponent } from '../materias.component';

describe('HU-03: filtrar materias por carrera', () => {
  let fixture: ComponentFixture<MateriasComponent>;
  let http: HttpTestingController;
  const endpoint = 'http://localhost:8081/api/materias';
  const sistemas = 'Ingeniería de Sistemas';
  const config = APP_CONFIG as { DEMO_MODE: boolean };
  const originalDemoMode = config.DEMO_MODE;
  const materias: Materia[] = [
    { id: 1, codigo: 'INF-101', nombre: 'Programación I', carrera: sistemas, semestre: 1 },
    { id: 2, codigo: 'INF-201', nombre: 'Programación II', carrera: sistemas, semestre: 2 },
    { id: 3, codigo: 'CIV-101', nombre: 'Matemática I', carrera: 'Ingeniería Civil', semestre: 1 }
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
    http.expectOne(endpoint).flush(materias);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    http.verify();
    vi.useRealTimers();
    config.DEMO_MODE = originalDemoMode;
  });

  function selector(): HTMLSelectElement {
    return fixture.nativeElement.querySelector('#filtrar-carrera');
  }

  function seleccionar(carrera: string): void {
    selector().value = carrera;
    selector().dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
  }

  function escribir(nombre: string): void {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = nombre;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  function peticion(carrera = '', nombre = '') {
    return http.expectOne(req => req.method === 'GET' && req.url === endpoint &&
      req.params.get('carrera') === (carrera || null) &&
      req.params.get('nombre') === (nombre || null) &&
      req.params.keys().length === Number(!!carrera) + Number(!!nombre));
  }

  function codigosVisibles(): string[] {
    const codigos: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.materia-card__codigo');
    return Array.from(codigos, codigo => codigo.textContent!.trim());
  }

  it('ofrece solo Todas y Sistemas aunque el catálogo incluya otras carreras', () => {
    expect(selector().value).toBe('');
    expect(Array.from(selector().options, opcion => opcion.textContent)).toEqual([
      'Todas', sistemas
    ]);
    expect(fixture.nativeElement.querySelector('label[for="filtrar-carrera"]').textContent).toBe('Carrera');
  });

  it('consulta por carrera, muestra sus materias y permite volver a Todas', () => {
    seleccionar(sistemas);
    expect(codigosVisibles()).toEqual([]);
    peticion(sistemas).flush(materias.slice(0, 2));
    fixture.detectChanges();
    expect(codigosVisibles()).toEqual(['INF-101', 'INF-201']);
    expect(fixture.nativeElement.querySelector('.materias-page__total').textContent)
      .toMatch(/2\s+materias encontradas/);
    expect(selector().options.length).toBe(2);

    seleccionar('');
    peticion().flush(materias);
    fixture.detectChanges();
    expect(codigosVisibles()).toEqual(['INF-101', 'INF-201', 'CIV-101']);
  });

  it('combina nombre y carrera, y conserva cada filtro al limpiar el otro', async () => {
    seleccionar(sistemas);
    peticion(sistemas).flush(materias.slice(0, 2));
    escribir('  Programación II  ');
    await vi.advanceTimersByTimeAsync(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
    peticion(sistemas, 'Programación II').flush([materias[1]]);
    fixture.detectChanges();
    expect(codigosVisibles()).toEqual(['INF-201']);

    seleccionar('');
    peticion('', 'Programación II').flush([materias[1]]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').value).toBe('  Programación II  ');

    seleccionar(sistemas);
    peticion(sistemas, 'Programación II').flush([materias[1]]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.materias-search__clear').click();
    peticion(sistemas).flush(materias.slice(0, 2));
    fixture.detectChanges();
    expect(selector().value).toBe(sistemas);
    expect(codigosVisibles()).toEqual(['INF-101', 'INF-201']);
  });

  it('informa que una carrera no tiene materias sin sustituir el resultado por datos demo', () => {
    config.DEMO_MODE = true;
    seleccionar(sistemas);
    peticion(sistemas).flush([]);
    fixture.detectChanges();
    expect(codigosVisibles()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.CAREER_EMPTY_TITLE);
    expect(fixture.nativeElement.querySelector('.materias-page__demo')).toBeNull();
    expect(selector().value).toBe(sistemas);
    expect(selector().options.length).toBe(2);
  });

  it('distingue una búsqueda sin coincidencias dentro de una carrera', async () => {
    seleccionar(sistemas);
    peticion(sistemas).flush(materias.slice(0, 2));
    escribir('Química');
    await vi.advanceTimersByTimeAsync(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
    peticion(sistemas, 'Química').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.CAREER_SEARCH_EMPTY_DESCRIPTION);
    expect(fixture.nativeElement.textContent).not.toContain(MESSAGES.CAREER_EMPTY_TITLE);
  });

  it('cancela peticiones obsoletas y la espera por nombre al cambiar la carrera', async () => {
    seleccionar(sistemas);
    const anterior = peticion(sistemas);
    seleccionar('');
    expect(anterior.cancelled).toBe(true);
    peticion().flush([]);

    escribir('Programación');
    seleccionar(sistemas);
    peticion(sistemas, 'Programación').flush(materias.slice(0, 2));
    await vi.advanceTimersByTimeAsync(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
    fixture.detectChanges();
    http.expectNone(() => true);
    expect(codigosVisibles()).toEqual(['INF-101', 'INF-201']);
  });

  it('muestra un error y reintenta conservando carrera y nombre sin datos demo', async () => {
    config.DEMO_MODE = true;
    seleccionar(sistemas);
    peticion(sistemas).flush(materias.slice(0, 2));
    escribir('Programación');
    await vi.advanceTimersByTimeAsync(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
    peticion(sistemas, 'Programación').flush('Error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(MESSAGES.ERROR_TITLE);
    expect(fixture.nativeElement.querySelector('.materias-page__demo')).toBeNull();
    fixture.nativeElement.querySelector('[role="alert"] button').click();
    peticion(sistemas, 'Programación').flush(materias.slice(0, 2));
    fixture.detectChanges();
    expect(codigosVisibles()).toEqual(['INF-101', 'INF-201']);
    expect(selector().value).toBe(sistemas);
  });
});
