import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { NEVER, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { MaterialResponse } from '../../../../../models/material.model';
import { ApiService } from '../../../../../services/api';
import { LanguageService } from '../../../../../services/language.service';
import { MESSAGES } from '../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../strings/materias/materias-ingles.messages';
import { MaterialesComponent } from './materiales.component';

const ID_MATERIA = 42;

type FiltrosMaterial = { idDocente?: number; semestre?: number; tipo?: string };

const MATERIALES: MaterialResponse[] = [
  {
    id: 1, linkMaterial: 'pruebas/1.pdf', titulo: 'Parcial resuelto',
    descripcion: 'Soluciones del parcial.', tipo: 'PDF', idMateria: ID_MATERIA,
    nombreMateria: 'Materia de prueba', idDocente: 1, nombreDocente: 'Ana Pérez',
    semestreIngresado: 1, estado: 'ACTIVO'
  },
  {
    id: 2, linkMaterial: 'pruebas/2.docx', titulo: 'Guía de ejercicios',
    descripcion: 'Ejercicios prácticos.', tipo: 'WORD', idMateria: ID_MATERIA,
    nombreMateria: 'Materia de prueba', idDocente: 2, nombreDocente: 'Luis Rojas',
    semestreIngresado: 2, estado: 'ACTIVO'
  },
  {
    id: 3, linkMaterial: 'pruebas/3.pdf', titulo: 'Segundo parcial',
    descripcion: 'Evaluación de unidad.', tipo: 'PDF', idMateria: ID_MATERIA,
    nombreMateria: 'Materia de prueba', idDocente: 1, nombreDocente: 'Ana Pérez',
    semestreIngresado: 1, estado: 'ACTIVO'
  },
  {
    id: 4, linkMaterial: 'pruebas/4.png', titulo: 'Diagrama de apoyo',
    descripcion: 'Imagen de referencia.', tipo: 'IMAGEN', idMateria: ID_MATERIA,
    nombreMateria: 'Materia de prueba', idDocente: 1, nombreDocente: 'Ana Pérez',
    semestreIngresado: 2, estado: 'ACTIVO'
  }
];

const crearRespuestaArchivo = (tipo = 'application/pdf', headers: Record<string, string> = {}) =>
  new HttpResponse<Blob>({
    body: new Blob(['contenido'], { type: tipo }),
    headers: new HttpHeaders({ 'Content-Type': tipo, ...headers })
  });

const showModalOriginal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const closeOriginal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');

const api = {
  obtenerMateriales: vi.fn((idMateria: number, filtros: FiltrosMaterial = {}) =>
    of(MATERIALES.filter(material =>
      material.idMateria === idMateria &&
      (filtros.idDocente == null || material.idDocente === filtros.idDocente) &&
      (filtros.semestre == null || material.semestreIngresado === filtros.semestre) &&
      (!filtros.tipo || material.tipo === filtros.tipo)
    ))
  ),
  descargarMaterial: vi.fn((_idMaterial: number) => of(crearRespuestaArchivo()))
};

describe('MaterialesComponent', () => {
  let fixture: ComponentFixture<MaterialesComponent>;
  let language: LanguageService;

  const titulos = () => Array.from(
    fixture.nativeElement.querySelectorAll('.material-card h2'),
    (heading: Element) => heading.textContent?.trim()
  );

  const seleccionar = (id: string, value: string) => {
    const select = fixture.nativeElement.querySelector(`#${id}`) as HTMLSelectElement;
    select.value = value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    api.obtenerMateriales.mockClear();
    api.descargarMaterial.mockReset();
    api.descargarMaterial.mockReturnValue(of(crearRespuestaArchivo()));
    class URLConBlob extends URL {
      static override createObjectURL = vi.fn(() => 'blob:material');
      static override revokeObjectURL = vi.fn();
    }
    vi.stubGlobal('URL', URLConBlob);
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value(this: HTMLDialogElement) { this.setAttribute('open', ''); }
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value(this: HTMLDialogElement) { this.removeAttribute('open'); }
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloadedFileName = this.download;
    });
    downloadedFileName = '';
    await TestBed.configureTestingModule({
      imports: [MaterialesComponent],
      providers: [{ provide: ApiService, useValue: api }]
    }).compileComponents();

    language = TestBed.inject(LanguageService);
    language.setLanguage('es');
    fixture = TestBed.createComponent(MaterialesComponent);
    fixture.componentRef.setInput('idMateria', ID_MATERIA);
    fixture.detectChanges();
  });

  afterEach(() => {
    language.setLanguage('es');
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (showModalOriginal) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', showModalOriginal);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    if (closeOriginal) Object.defineProperty(HTMLDialogElement.prototype, 'close', closeOriginal);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  });

  let downloadedFileName = '';

  it('inicia con Todos y muestra el catálogo recibido de la materia', () => {
    const selects = fixture.nativeElement.querySelectorAll('select');
    expect(Array.from(selects, (select: HTMLSelectElement) => select.value)).toEqual(['', '', '']);
    expect(titulos()).toEqual([
      'Parcial resuelto', 'Guía de ejercicios', 'Segundo parcial', 'Diagrama de apoyo'
    ]);
    expect(api.obtenerMateriales).toHaveBeenCalledWith(ID_MATERIA, {});
  });

  it('filtra por docente', () => {
    seleccionar('material-docente', '2');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(ID_MATERIA, { idDocente: 2 });
    expect(titulos()).toEqual(['Guía de ejercicios']);
  });

  it('filtra por semestre', () => {
    seleccionar('material-semestre', '2');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(ID_MATERIA, { semestre: 2 });
    expect(titulos()).toEqual(['Guía de ejercicios', 'Diagrama de apoyo']);
  });

  it('filtra por tipo', () => {
    seleccionar('material-tipo', 'WORD');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(ID_MATERIA, { tipo: 'WORD' });
    expect(titulos()).toEqual(['Guía de ejercicios']);
  });

  it('combina los tres criterios con Y', () => {
    seleccionar('material-docente', '1');
    seleccionar('material-semestre', '1');
    seleccionar('material-tipo', 'PDF');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(
      ID_MATERIA, { idDocente: 1, semestre: 1, tipo: 'PDF' }
    );
    expect(titulos()).toEqual(['Parcial resuelto', 'Segundo parcial']);
  });

  it('restablece solo el criterio que vuelve a Todos', () => {
    seleccionar('material-docente', '1');
    seleccionar('material-tipo', 'PDF');
    seleccionar('material-docente', '');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(ID_MATERIA, { tipo: 'PDF' });
    expect(titulos()).toEqual(['Parcial resuelto', 'Segundo parcial']);
    expect((fixture.nativeElement.querySelector('#material-tipo') as HTMLSelectElement).value).toBe('PDF');
  });

  it('muestra un estado distinto cuando no hay coincidencias', () => {
    seleccionar('material-docente', '2');
    seleccionar('material-semestre', '1');
    expect(api.obtenerMateriales).toHaveBeenLastCalledWith(
      ID_MATERIA, { idDocente: 2, semestre: 1 }
    );
    expect(titulos()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_NO_MATCHES);
  });

  it('cambia ES a EN y conserva las selecciones', () => {
    seleccionar('material-docente', '1');
    seleccionar('material-tipo', 'IMAGEN');
    language.setLanguage('en');
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('#material-docente') as HTMLSelectElement).value).toBe('1');
    expect(fixture.nativeElement.textContent).toContain(MESSAGES_EN.MATERIAL_TEACHER_FILTER);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES_EN.MATERIAL_FILTER_ALL);
    expect(fixture.nativeElement.textContent).toContain('Image');
    expect((fixture.nativeElement.querySelector('#material-tipo') as HTMLSelectElement).value).toBe('IMAGEN');
    expect(titulos()).toEqual(['Diagrama de apoyo']);
  });

  it('solo muestra acciones en materiales activos', () => {
    fixture.componentInstance.materiales.update(materiales => [
      ...materiales,
      { ...materiales[0], id: '5', estado: 'PENDIENTE', titulo: 'Pendiente' },
      { ...materiales[0], id: '6', estado: 'RECHAZADO', titulo: 'Rechazado' }
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.materiales__acciones button')).toHaveLength(8);
    expect(fixture.nativeElement.querySelectorAll('.material-card').length).toBe(6);
  });

  it('descarga con filename* de Content-Disposition y anuncia el inicio', () => {
    api.descargarMaterial.mockReturnValue(of(crearRespuestaArchivo('application/pdf', {
      'Content-Disposition': "attachment; filename*=UTF-8''parcial%20resuelto.pdf"
    })));
    const boton = fixture.nativeElement.querySelector('.materiales__acciones button:last-child') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    expect(api.descargarMaterial).toHaveBeenCalledWith(1);
    expect(downloadedFileName).toBe('parcial resuelto.pdf');
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_DOWNLOAD_SUCCESS);
  });

  it('usa la URL como fallback y elimina solo el prefijo UUID', () => {
    fixture.componentInstance.materiales.update(materiales => materiales.map(material =>
      material.id === '1'
        ? { ...material, linkMaterial: 'https://storage.test/550e8400-e29b-41d4-a716-446655440000-Parcial%20resuelto.pdf' }
        : material
    ));
    fixture.detectChanges();
    api.descargarMaterial.mockReturnValue(of(crearRespuestaArchivo()));
    const boton = fixture.nativeElement.querySelector('.materiales__acciones button:last-child') as HTMLButtonElement;
    boton.click();

    expect(downloadedFileName).toBe('Parcial resuelto.pdf');
  });

  it('no descarga la respuesta cuando falla la petición', () => {
    api.descargarMaterial.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 500,
      error: new Blob(['error'], { type: 'application/json' })
    })));
    const boton = fixture.nativeElement.querySelector('.materiales__acciones button:last-child') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    expect(downloadedFileName).toBe('');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain(MESSAGES.MATERIAL_ACTION_ERROR);
    expect(fixture.nativeElement.textContent).not.toContain(MESSAGES.MATERIAL_DOWNLOAD_SUCCESS);
  });

  it('abre y cierra la vista previa PDF liberando la URL temporal', () => {
    const boton = fixture.nativeElement.querySelector('.materiales__acciones button:first-child') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    const dialogo = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(api.descargarMaterial).toHaveBeenCalledWith(1);
    expect(dialogo.open).toBe(true);
    expect(dialogo.querySelector('iframe')?.title).toBe('Parcial resuelto');

    (dialogo.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(dialogo.open).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:material');
  });

  it('muestra imágenes en el diálogo de vista previa', () => {
    api.descargarMaterial.mockReturnValue(of(crearRespuestaArchivo('image/png')));
    const boton = fixture.nativeElement.querySelectorAll('.materiales__acciones button')[6] as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('dialog img')?.alt).toBe('Diagrama de apoyo');
    expect((fixture.nativeElement.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
  });

  it('muestra alternativa para Word sin pedir una vista previa incompatible', () => {
    const tarjetaWord = fixture.nativeElement.querySelectorAll('.material-card')[1] as HTMLElement;
    const boton = tarjetaWord.querySelector('.materiales__acciones button') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    expect(api.descargarMaterial).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_PREVIEW_UNAVAILABLE);
  });

  it('ignora clics repetidos mientras la descarga sigue en curso', () => {
    api.descargarMaterial.mockReturnValue(NEVER);
    const material = fixture.componentInstance.materiales()[0];
    fixture.componentInstance.descargar(material);
    fixture.componentInstance.descargar(material);

    expect(api.descargarMaterial).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.procesandoAccion()).toBe(true);
  });
});
