import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Materia } from '../../../models/materia';
import { APP_CONFIG } from '../../../config/app-config';
import { DEMO_MATERIAS } from '../../../data/demo-materias';
import { MESSAGES } from '../../../strings/materias/materias.messages';
import { MateriasComponent } from '../materias.component';

describe('HU-04: visualizar información de una materia', () => {
  let fixture: ComponentFixture<MateriasComponent>;
  let http: HttpTestingController;
  let dialogo: HTMLDialogElement;
  const endpoint = 'http://localhost:8081/api/materias';
  const carrerasEndpoint = `${endpoint}/carreras`;
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
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(MateriasComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(carrerasEndpoint).flush(['Ingeniería de Sistemas', 'Ingeniería Civil']);
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
    const boton: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.materia-card__informacion')[indice];
    boton.click();
    fixture.detectChanges();
    return boton;
  }

  function responder(materias: Materia[]): void {
    http.expectOne(endpoint).flush(materias);
    fixture.detectChanges();
  }

  it('abre la información de la materia elegida con una etiqueta accesible y sin confundir descripción con prerrequisitos', () => {
    responder([{
      id: 25, codigo: 'MAT-102', nombre: 'Matemática II', carrera: 'Ingeniería Civil', semestre: 2
    }, materia]);
    const boton = abrir(1);
    expect(boton.getAttribute('aria-haspopup')).toBe('dialog');
    expect(boton.getAttribute('aria-label')).toBe(`${MESSAGES.INFORMATION_BUTTON}: ${materia.nombre}`);
    expect(dialogo.showModal).toHaveBeenCalledOnce();
    expect(dialogo.getAttribute('aria-labelledby')).toBe('titulo-detalle');
    expect(dialogo.querySelector('h2')?.textContent).toBe(materia.nombre);
    expect(dialogo.textContent).toContain(materia.codigo);
    expect(dialogo.textContent).toContain(materia.carrera);
    const semestre = Array.from(dialogo.querySelectorAll('dl div'))
      .find(fila => fila.querySelector('dt')?.textContent === 'Semestre sugerido');
    expect(semestre?.querySelector('dd')?.textContent).toBe('1');
    const prerrequisitos = dialogo.querySelector('[aria-labelledby="prerrequisitos-detalle"]');
    expect(prerrequisitos?.querySelector('h3')?.textContent).toBe('Prerrequisitos');
    expect(prerrequisitos?.querySelector('p')?.textContent).toBe(MESSAGES.MODAL_INFORMATION_UNAVAILABLE);
    expect(dialogo.textContent).not.toContain(materia.descripcion!);
    const recomendaciones = dialogo.querySelector('[aria-labelledby="conocimientos-detalle"]');
    expect(recomendaciones?.textContent).toContain(materia.conocimientosPreviosRecomendados!);
    expect(recomendaciones?.textContent).not.toContain('6.2');
    expect(dialogo.textContent).not.toContain('MAT-102');
    http.expectNone(() => true);
  });

  it('Explorar materia navega con el id de la tarjeta seleccionada sin abrir el modal', () => {
    responder([materia, {
      id: 25, codigo: 'MAT-102', nombre: 'Matemática II', carrera: 'Ingeniería Civil', semestre: 2
    }]);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const botones: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.materia-card .materia-button');
    botones[1].click();
    expect(navegar).toHaveBeenCalledExactlyOnceWith(['/materias', 25]);
    expect(botones[1].hasAttribute('aria-haspopup')).toBe(false);
    expect(dialogo.showModal).not.toHaveBeenCalled();
    expect(fixture.componentInstance.materiaSeleccionada()).toBeNull();
    http.expectNone(() => true);
  });

  it('conserva el acceso a calificaciones desde el modal usando la materia seleccionada', () => {
    responder([materia]);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    abrir();
    dialogo.querySelector<HTMLButtonElement>('.materia-button')!.click();
    expect(dialogo.close).toHaveBeenCalledOnce();
    expect(navegar).toHaveBeenCalledExactlyOnceWith(['/materias', materia.id]);
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
    const cerrar = dialogo.querySelector<HTMLButtonElement>('.materia-detalle__cerrar')!;
    expect(cerrar.getAttribute('aria-label')).toBe(MESSAGES.CLOSE_INFORMATION_BUTTON);
    expect(dialogo.textContent).not.toContain('Volver al catálogo');
    cerrar.click();
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
    expect(dialogo.textContent).not.toContain(DEMO_MATERIAS[0].descripcion!);
    expect(dialogo.querySelector('[aria-labelledby="prerrequisitos-detalle"] p')?.textContent)
      .toBe(MESSAGES.MODAL_INFORMATION_UNAVAILABLE);
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
