import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Materia } from '../../models/materia';
import { APP_CONFIG } from '../../strings/app-config';
import { DEMO_MATERIAS } from '../../strings/demo-data';
import { MESSAGES } from '../../strings/messages';
import { MateriasComponent } from './materias.component';

describe('HU-04: visualizar información de una materia', () => {
  let fixture: ComponentFixture<MateriasComponent>;
  let http: HttpTestingController;
  let dialogo: HTMLDialogElement;
  const endpoint = 'http://localhost:8081/api/materias';
  const config = APP_CONFIG as { DEMO_MODE: boolean };
  const originalDemoMode = config.DEMO_MODE;
  const materia: Materia = {
    id: 11, codigo: 'INF-101', nombre: 'Programación I',
    carrera: 'Ingeniería de Sistemas', semestre: 1,
    descripcion: 'Introducción a los algoritmos.\nResolución de problemas con programas sencillos.',
    conocimientosPreviosRecomendados: 'Lógica básica y operaciones matemáticas elementales.',
    conocimientosPrevios: { valor: 6.2, total: 10 }
  };

  beforeEach(async () => {
    config.DEMO_MODE = false;
    await TestBed.configureTestingModule({
      imports: [MateriasComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    fixture = TestBed.createComponent(MateriasComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    dialogo = fixture.nativeElement.querySelector('dialog');
    // jsdom no implementa la apertura modal ni el cierre nativo con Escape.
    dialogo.showModal = vi.fn();
    dialogo.close = vi.fn(() => dialogo.dispatchEvent(new Event('close')));
  });

  afterEach(() => {
    fixture.destroy();
    http.verify();
    config.DEMO_MODE = originalDemoMode;
  });

  function abrir(indice = 0): HTMLButtonElement {
    const boton: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.materia-card button')[indice];
    boton.click();
    fixture.detectChanges();
    return boton;
  }

  function responder(materias: Materia[]): void {
    http.expectOne(endpoint).flush(materias);
    fixture.detectChanges();
  }

  it('abre la materia elegida con nombre, código, carrera, semestre, descripción y recomendaciones', () => {
    responder([{
      id: 25, codigo: 'MAT-102', nombre: 'Matemática II', carrera: 'Ingeniería Civil', semestre: 2
    }, materia]);
    const boton = abrir(1);
    expect(boton.getAttribute('aria-haspopup')).toBe('dialog');
    expect(dialogo.showModal).toHaveBeenCalledOnce();
    expect(dialogo.getAttribute('aria-labelledby')).toBe('titulo-detalle');
    expect(dialogo.querySelector('h2')?.textContent).toBe(materia.nombre);
    expect(dialogo.textContent).toContain(materia.codigo);
    expect(dialogo.textContent).toContain(materia.carrera);
    const semestre = Array.from(dialogo.querySelectorAll('dl div'))
      .find(fila => fila.querySelector('dt')?.textContent === 'Semestre sugerido');
    expect(semestre?.querySelector('dd')?.textContent).toBe('1');
    expect(dialogo.querySelector('[aria-labelledby="descripcion-detalle"] p')?.textContent)
      .toBe(materia.descripcion);
    const recomendaciones = dialogo.querySelector('[aria-labelledby="conocimientos-detalle"]');
    expect(recomendaciones?.textContent).toContain(materia.conocimientosPreviosRecomendados!);
    expect(recomendaciones?.textContent).not.toContain('6.2');
    expect(dialogo.textContent).not.toContain('MAT-102');
    http.expectNone(() => true);
  });

  it.each([undefined, null, '', '   '])('informa cuando faltan textos (%s), sin usar la puntuación como recomendación', valor => {
    responder([{ ...materia, descripcion: valor, conocimientosPreviosRecomendados: valor }]);
    abrir();
    const secciones = dialogo.querySelectorAll('.materia-detalle__seccion p');
    expect(Array.from(secciones, seccion => seccion.textContent)).toEqual([
      MESSAGES.MODAL_INFORMATION_UNAVAILABLE, MESSAGES.MODAL_INFORMATION_UNAVAILABLE
    ]);
    expect(dialogo.textContent).toContain('6.2/10');
  });

  it('vuelve al catálogo conservando nombre, carrera, resultados y foco sin repetir la consulta', () => {
    responder([materia]);
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="search"]');
    input.value = 'Programación';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const carrera: HTMLSelectElement = fixture.nativeElement.querySelector('#filtrar-carrera');
    carrera.value = materia.carrera;
    carrera.dispatchEvent(new Event('change', { bubbles: true }));
    http.expectOne(req => req.url === endpoint && req.params.get('nombre') === 'Programación' &&
      req.params.get('carrera') === materia.carrera).flush([materia]);
    fixture.detectChanges();
    const tarjeta = fixture.nativeElement.querySelector('.materia-card');
    const boton = abrir();
    dialogo.querySelector('button')!.click();
    fixture.detectChanges();
    expect(dialogo.close).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.materiaSeleccionada()).toBeNull();
    expect(input.value).toBe('Programación');
    expect(carrera.value).toBe(materia.carrera);
    expect(fixture.nativeElement.querySelector('.materia-card')).toBe(tarjeta);
    expect(document.activeElement).toBe(boton);
    http.expectNone(() => true);
  });

  it('limpia el detalle al recibir el cierre nativo y abre otra materia sin información anterior', () => {
    responder([materia, {
      id: 25, codigo: 'MAT-102', nombre: 'Matemática II', carrera: 'Ingeniería Civil', semestre: 2
    }]);
    const boton = abrir();
    dialogo.dispatchEvent(new Event('close'));
    fixture.detectChanges();
    expect(fixture.componentInstance.materiaSeleccionada()).toBeNull();
    expect(document.activeElement).toBe(boton);
    abrir(1);
    expect(dialogo.querySelector('h2')?.textContent).toBe('Matemática II');
    expect(dialogo.textContent).not.toContain(materia.descripcion!);
    expect(dialogo.textContent).not.toContain(materia.conocimientosPreviosRecomendados!);
    expect(dialogo.textContent).toContain(MESSAGES.MODAL_INFORMATION_UNAVAILABLE);
  });

  it('muestra ejemplos completos identificados como demo solo cuando está activo ese modo', () => {
    config.DEMO_MODE = true;
    responder([]);
    abrir();
    expect(dialogo.querySelector('.materias-page__demo')?.textContent).toBe(MESSAGES.DEMO_NOTICE);
    expect(dialogo.textContent).toContain(DEMO_MATERIAS[0].descripcion!);
    expect(dialogo.textContent).toContain(DEMO_MATERIAS[0].conocimientosPreviosRecomendados!);
    dialogo.querySelector('button')!.click();
    fixture.componentInstance.cargarMaterias();
    responder([{ ...materia, descripcion: undefined, conocimientosPreviosRecomendados: undefined }]);
    abrir();
    expect(dialogo.querySelector('.materias-page__demo')).toBeNull();
    expect(dialogo.textContent).toContain(MESSAGES.MODAL_INFORMATION_UNAVAILABLE);
    expect(dialogo.textContent).not.toContain(DEMO_MATERIAS[0].descripcion!);
  });
});
