import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Materia } from '../../../models/materia';
import { APP_CONFIG } from '../../../config/app-config';
import { DEMO_MATERIAS } from '../../../data/demo-materias';
import { LanguageService } from '../../../services/language.service';
import { MESSAGES } from '../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../strings/materias/materias-ingles.messages';
import { MateriasComponent } from './materias.component';
import { Router } from '@angular/router';

describe('HU-01: catálogo de materias', () => {
  let fixture: ComponentFixture<MateriasComponent>;
  let http: HttpTestingController;
  let languageService: LanguageService | undefined;
  const endpoint = 'https://tallersisinfoproyect.onrender.com/api/materias';
  const carrerasEndpoint = `${endpoint}/carreras`;
  const promediosEndpoint = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.CALIFICACION_MATERIA_PROMEDIOS}`;
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
    languageService = TestBed.inject(LanguageService);
    languageService.setLanguage('es');
    fixture = TestBed.createComponent(MateriasComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(carrerasEndpoint).flush(['Ingeniería de Sistemas', 'Ingeniería Civil']);
    http.expectOne(promediosEndpoint).flush([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    languageService?.setLanguage('es');
    config.DEMO_MODE = originalDemoMode;
    http.verify();
  });

  describe('HU-32: búsqueda de material académico por materia', () => {
    const nombresVisibles = () => Array.from(
      fixture.nativeElement.querySelectorAll('.materia-card h2') as NodeListOf<HTMLElement>,
      titulo => titulo.textContent!.trim()
    );

    function escribir(termino: string): void {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('#buscar-materia');
      input.value = termino;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    function responderBusqueda(termino: string, respuesta = materias): void {
      http.expectOne(req => req.url === endpoint &&
        req.params.get('nombre') === termino).flush(respuesta);
      fixture.detectChanges();
    }

    beforeEach(() => {
      http.expectOne(endpoint).flush(materias);
      fixture.detectChanges();
      vi.useFakeTimers();
    });

    it('actualiza el mismo input de Programación a Matemática sin recrear el componente', () => {
      const input = fixture.nativeElement.querySelector('#buscar-materia');
      escribir('Programación');
      vi.advanceTimersByTime(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE - 1);
      http.expectNone(req => req.url === endpoint);
      vi.advanceTimersByTime(1);
      responderBusqueda('Programación');
      expect(nombresVisibles()).toEqual(['Programación I']);

      escribir('Matemática');
      vi.advanceTimersByTime(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
      responderBusqueda('Matemática');
      expect(nombresVisibles()).toEqual(['Matemática II']);
      expect(fixture.nativeElement.querySelector('#buscar-materia')).toBe(input);
    });

    it('cancela una respuesta anterior para que no reemplace la búsqueda más reciente', () => {
      escribir('Programación');
      vi.advanceTimersByTime(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
      const anterior = http.expectOne(req => req.params.get('nombre') === 'Programación');
      escribir('Matemática');
      expect(anterior.cancelled).toBe(true);
      vi.advanceTimersByTime(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
      responderBusqueda('Matemática');
      expect(nombresVisibles()).toEqual(['Matemática II']);
    });

    it('consulta por el nombre ingresado después del debounce', () => {
      escribir('Programación');
      vi.advanceTimersByTime(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
      responderBusqueda('Programación', [materias[0]]);
      expect(nombresVisibles()).toEqual(['Programación I']);
    });

    it('mantiene únicamente coincidencias aunque la API entregue varias materias', () => {
      escribir('Matemática');
      vi.advanceTimersByTime(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
      responderBusqueda('Matemática');
      expect(nombresVisibles()).toEqual(['Matemática II']);
    });

    it('muestra el mensaje sin resultados y ninguna tarjeta para un término inexistente', () => {
      escribir('xyz-no-existe');
      vi.advanceTimersByTime(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
      // Los términos con guion consultan el catálogo y se filtran localmente.
      http.expectOne(endpoint).flush(materias);
      fixture.detectChanges();
      expect(nombresVisibles()).toEqual([]);
      expect(fixture.nativeElement.querySelector('#resultados-materias [role="status"]').textContent)
        .toContain(MESSAGES.SEARCH_EMPTY_TITLE);
    });

    it('recupera el catálogo al limpiar el mismo input y reinicia la paginación', () => {
      escribir('Programación');
      vi.advanceTimersByTime(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
      responderBusqueda('Programación');
      fixture.componentInstance.paginaActual.set(2);
      escribir('');
      http.expectOne(endpoint).flush(materias);
      fixture.detectChanges();
      expect(nombresVisibles()).toEqual(['Programación I', 'Matemática II']);
      expect(fixture.componentInstance.paginaActual()).toBe(1);
    });

    it('abre el detalle correspondiente desde la materia encontrada', () => {
      const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      escribir('Matemática');
      vi.advanceTimersByTime(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE);
      responderBusqueda('Matemática');
      fixture.nativeElement.querySelector('.materia-card .materia-button').click();
      expect(navegar).toHaveBeenCalledWith(['/materias', materias[1].id]);
      navegar.mockRestore();
    });
  });

  it('consulta la API y muestra nombre, código y carrera de cada materia', async () => {
    expect(fixture.nativeElement.textContent).toContain('Cargando materias');
    http.expectOne({ method: 'GET', url: endpoint }).flush(materias);
    await fixture.whenStable();

    const tarjetas = fixture.nativeElement.querySelectorAll('.materia-card');
    expect(tarjetas.length).toBe(2);
    for (let i = 0; i < materias.length; i++) {
      expect(tarjetas[i].textContent).toContain(materias[i].nombre);
      expect(tarjetas[i].textContent).toContain(materias[i].codigo);
      expect(tarjetas[i].textContent).toContain(materias[i].carrera);
    }
    expect(fixture.nativeElement.textContent).not.toContain('Cargando materias');
  });

  it('preserves the original API name when a code has no translation', async () => {
    const sinTraduccion: Materia = {
      id: 50,
      codigo: 'NEW-999',
      nombre: 'Materia Nueva',
      carrera: 'Ingeniería Civil',
      semestre: 1
    };
    http.expectOne(endpoint).flush([sinTraduccion]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.materia-card h2').textContent)
      .toContain(sinTraduccion.nombre);
    fixture.debugElement.injector.get(LanguageService).setLanguage('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.materia-card h2').textContent)
      .toContain(sinTraduccion.nombre);
  });

  it('translates card names by API code and updates immediately when the language changes', async () => {
    const algebra: Materia = {
      id: 123,
      codigo: 'mat-123',
      nombre: 'Álgebra lineal',
      carrera: 'Ingeniería Civil',
      semestre: 1
    };
    http.expectOne(endpoint).flush([algebra]);
    await fixture.whenStable();

    const nombreTarjeta = () =>
      fixture.nativeElement.querySelector('.materia-card h2').textContent.trim();
    expect(nombreTarjeta()).toBe('Álgebra lineal');

    languageService!.setLanguage('en');
    fixture.detectChanges();
    expect(nombreTarjeta()).toBe(MESSAGES_EN.SUBJECT_NAMES['MAT-123']);

    languageService!.setLanguage('es');
    fixture.detectChanges();
    expect(nombreTarjeta()).toBe(MESSAGES.SUBJECT_NAMES['MAT-123']);
    http.expectNone(endpoint);
  });

  it('muestra el estado vacío cuando la API devuelve una lista vacía', async () => {
    http.expectOne(endpoint).flush([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Aún no hay materias disponibles');
    expect(fixture.nativeElement.querySelectorAll('.materia-card').length).toBe(0);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('distingue un error del catálogo vacío y permite reintentar la consulta', async () => {
    http.expectOne(endpoint).flush('Error', { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('No pudimos cargar las materias');
    expect(fixture.nativeElement.textContent).not.toContain('Aún no hay materias');

    fixture.nativeElement.querySelector('button').click();
    http.expectOne({ method: 'GET', url: endpoint }).flush([materias[0]]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.materia-card').length).toBe(1);
  });

  it('muestra los datos de la materia seleccionada y conserva el catálogo al cerrar', async () => {
    http.expectOne(endpoint).flush(materias);
    await fixture.whenStable();
    const dialogo: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    // jsdom no implementa estas APIs nativas; su comportamiento requiere revisión manual en navegador.
    dialogo.showModal = vi.fn();
    dialogo.close = vi.fn(() => dialogo.dispatchEvent(new Event('close')));

    fixture.nativeElement.querySelectorAll('.materia-card__informacion')[1].click();
    await fixture.whenStable();
    expect(dialogo.showModal).toHaveBeenCalledOnce();
    expect(dialogo.querySelector('h2')?.textContent).toBe('Matemática II');
    expect(dialogo.textContent).toContain('MAT-102');
    expect(dialogo.textContent).toContain('Ingeniería Civil');
    expect(dialogo.textContent).not.toContain('INF-101');

    dialogo.querySelector('button')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.materiaSeleccionada()).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.materia-card').length).toBe(2);
    http.expectNone(endpoint);
  });

  it('no inventa puntuaciones ni cantidades de evaluaciones que la API no entrega', async () => {
    http.expectOne(endpoint).flush([materias[0]]);
    await fixture.whenStable();
    const tarjeta = fixture.nativeElement.querySelector('.materia-card');
    expect(tarjeta.textContent).toContain('Sin datos');
    expect(tarjeta.textContent).toContain('Evaluaciones no disponibles');
    expect(tarjeta.textContent).not.toContain('/10');
    expect(tarjeta.textContent).not.toContain('127');
  });

  it('localizes fallback catalog data as the language changes in both directions', async () => {
    config.DEMO_MODE = true;
    http.expectOne(endpoint).flush([]);
    await fixture.whenStable();

    const dialogo: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    dialogo.showModal = vi.fn();
    dialogo.close = vi.fn();

    expect(fixture.nativeElement.textContent).toContain('Programación I');
    expect(fixture.nativeElement.textContent).toContain('Ingeniería de Sistemas');

    fixture.nativeElement.querySelector('.materia-card__informacion').click();
    fixture.detectChanges();
    expect(dialogo.textContent).toContain(
      MESSAGES.DEMO_SUBJECTS[0].conocimientosPreviosRecomendados
    );

    fixture.debugElement.injector.get(LanguageService).setLanguage('en');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Programming I');
    expect(fixture.nativeElement.textContent).toContain('Systems Engineering');
    expect(dialogo.textContent).toContain(
      MESSAGES_EN.DEMO_SUBJECTS[0].conocimientosPreviosRecomendados
    );

    fixture.debugElement.injector.get(LanguageService).setLanguage('es');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Programación I');
    expect(dialogo.textContent).toContain(
      MESSAGES.DEMO_SUBJECTS[0].conocimientosPreviosRecomendados
    );
  });

  it('cancela la consulta pendiente al abandonar el catálogo', () => {
    const peticion = http.expectOne(endpoint);
    fixture.destroy();
    expect(peticion.cancelled).toBe(true);
  });
});
