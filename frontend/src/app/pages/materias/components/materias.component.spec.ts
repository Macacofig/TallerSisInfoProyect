import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Materia } from '../../../models/materia';
import { APP_CONFIG } from '../../../config/app-config';
import { DEMO_MATERIAS } from '../../../data/demo-materias';
import { MateriasComponent } from '../materias.component';

describe('HU-01: catálogo de materias', () => {
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
    fixture = TestBed.createComponent(MateriasComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    config.DEMO_MODE = originalDemoMode;
    http.verify();
  });

  for (const respuesta of ['vacia', 'error'] as const) {
    it(`muestra tarjetas e indicadores de demostración ante respuesta ${respuesta} con modo activo`, async () => {
      config.DEMO_MODE = true;
      const peticion = http.expectOne(endpoint);
      if (respuesta === 'vacia') peticion.flush([]);
      else peticion.flush('Error', { status: 500, statusText: 'Internal Server Error' });
      await fixture.whenStable();
      expect(fixture.componentInstance.materias()).toEqual(DEMO_MATERIAS);
      expect(fixture.nativeElement.querySelectorAll('.materia-card').length).toBe(DEMO_MATERIAS.length);
      expect(fixture.nativeElement.querySelector('.materias-page__demo').textContent).toContain('Datos de demostración');
      expect(fixture.nativeElement.querySelector('.materia-card').textContent).toContain('7.4');
      expect(fixture.nativeElement.querySelector('.materia-card .materia-button').textContent).toContain('Explorar materia');

      fixture.componentInstance.cargarMaterias();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.materias-page__demo')).toBeNull();
      http.expectOne(endpoint).flush(materias);
      await fixture.whenStable();
      expect(fixture.componentInstance.materias()).toEqual(materias);
      expect(fixture.nativeElement.querySelector('.materias-page__demo')).toBeNull();
    });
  }

  it('prioriza materias reales con modo demostración activo', async () => {
    config.DEMO_MODE = true;
    http.expectOne(endpoint).flush(materias);
    await fixture.whenStable();
    expect(fixture.componentInstance.materias()).toEqual(materias);
    expect(fixture.nativeElement.querySelector('.materias-page__demo')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.materia-card').length).toBe(2);
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

  it('cancela la consulta pendiente al abandonar el catálogo', () => {
    const peticion = http.expectOne(endpoint);
    fixture.destroy();
    expect(peticion.cancelled).toBe(true);
  });
});
