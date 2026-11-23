import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { MaterialEstudiante, EstadoRevisionMaterial } from '../../models/material-estudiante.model';
import { LoginResponse } from '../../models/login';
import { AuthService } from '../../services/auth.service';
import { MaterialEstudianteService } from '../../services/material-estudiante.service';
import { LanguageService } from '../../services/language.service';
import { MisMateriales } from './mis-materiales';
import { estadoVisualMaterial, filtrarMateriales } from './mis-materiales.utils';

describe('MisMateriales', () => {
  let fixture: ComponentFixture<MisMateriales>;
  let auth: AuthService;
  let language: LanguageService;
  let respuesta: Subject<MaterialEstudiante[]>;
  let obtenerMisMateriales: ReturnType<typeof vi.fn>;
  const materiales: MaterialEstudiante[] = [
    { id: 11, titulo: 'Álgebra lineal', nombreMateria: 'Matemática I', tipo: 'PDF', estado: 'PENDIENTE' },
    { id: 12, titulo: 'Cálculo diferencial', nombreMateria: 'Cálculo I', tipo: 'WORD', estado: 'APROBADO' },
    { id: 13, titulo: 'Guía de álgebra', nombreMateria: 'Matemática I', tipo: 'POWERPOINT', estado: 'NEGADO' }
  ];

  function usuario(): LoginResponse {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    return {
      id: 41, nombre: 'Lucía Pérez', carrera: 'Ingeniería de Sistemas',
      correoElectronico: 'lucia@test.invalid', telefono: '71234567',
      accessToken: `header.${payload}.signature`
    };
  }

  beforeEach(async () => {
    localStorage.removeItem('usuario');
    respuesta = new Subject<MaterialEstudiante[]>();
    obtenerMisMateriales = vi.fn(() => respuesta.asObservable());
    await TestBed.configureTestingModule({
      imports: [MisMateriales],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: MaterialEstudianteService, useValue: { obtenerMisMateriales } }
      ]
    }).compileComponents();
    auth = TestBed.inject(AuthService);
    language = TestBed.inject(LanguageService);
    language.setLanguage('es');
    auth.guardarUsuario(usuario());
    fixture = TestBed.createComponent(MisMateriales);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    auth.cerrarSesion();
  });

  it('muestra encabezado y estado de carga accesibles', () => {
    const pantalla = fixture.nativeElement as HTMLElement;
    expect(pantalla.querySelector('h1')?.textContent).toBe('Mis materiales');
    expect(pantalla.querySelector('h2')?.textContent).toBe('Bitácora de materiales');
    expect(pantalla.querySelector('[role="status"]')?.textContent).toContain('Cargando tus materiales');
    expect(pantalla.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(obtenerMisMateriales).toHaveBeenCalledOnce();
  });

  it('muestra título, materia, tipo y los estados pendientes, aprobados y rechazados', async () => {
    respuesta.next(materiales);
    respuesta.complete();
    await fixture.whenStable();
    fixture.detectChanges();

    const pantalla = fixture.nativeElement as HTMLElement;
    expect(Array.from(pantalla.querySelectorAll('h3'), elemento => elemento.textContent))
      .toEqual(materiales.map(material => material.titulo));
    expect(pantalla.textContent).toContain('Matemática I');
    expect(pantalla.textContent).toContain('PDF');
    expect(pantalla.textContent).toContain('Documento Word');
    expect(Array.from(pantalla.querySelectorAll('.mis-materiales__badge'), badge => badge.textContent?.trim()))
      .toEqual(['Pendiente', 'Aprobado', 'Rechazado']);
    expect(Array.from(pantalla.querySelectorAll('.mis-materiales__badge'), badge => badge.getAttribute('data-estado')))
      .toEqual(['pendiente', 'aprobado', 'rechazado']);
    expect(pantalla.querySelector('[aria-busy="false"]')).not.toBeNull();
  });

  it('filtra por título sin distinguir mayúsculas ni tildes y luego por estado', async () => {
    respuesta.next(materiales);
    respuesta.complete();
    await fixture.whenStable();
    fixture.detectChanges();

    const busqueda = fixture.nativeElement.querySelector('#material-titulo') as HTMLInputElement;
    busqueda.value = 'algebra';
    busqueda.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(Array.from(fixture.nativeElement.querySelectorAll('h3'), (elemento: HTMLElement) => elemento.textContent))
      .toEqual(['Álgebra lineal', 'Guía de álgebra']);

    const estado = fixture.nativeElement.querySelector('#material-estado') as HTMLSelectElement;
    estado.value = 'NEGADO';
    estado.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(Array.from(fixture.nativeElement.querySelectorAll('h3'), (elemento: HTMLElement) => elemento.textContent))
      .toEqual(['Guía de álgebra']);
  });

  it('distingue la lista vacía de los filtros sin coincidencias', () => {
    respuesta.next([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Todavía no has enviado materiales.');

    respuesta.next(materiales);
    fixture.detectChanges();
    const busqueda = fixture.nativeElement.querySelector('#material-titulo') as HTMLInputElement;
    busqueda.value = 'inexistente';
    busqueda.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay materiales que coincidan');
  });

  it('muestra el estado negado aunque el material ya no esté vinculado', () => {
    respuesta.next([{
      id: 14, titulo: 'Guía rechazada', nombreMateria: null, tipo: null, estado: 'NEGADO'
    }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h3')?.textContent).toBe('Guía rechazada');
    expect(fixture.nativeElement.textContent).toContain('Materia: No disponible');
    expect(fixture.nativeElement.textContent).toContain('Tipo de archivo: No disponible');
    expect(fixture.nativeElement.querySelector('.mis-materiales__badge')?.textContent).toContain('Rechazado');
  });

  it('muestra y permite reintentar un error de consulta', async () => {
    respuesta.error(new Error('Error temporal'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('No se pudieron cargar');

    obtenerMisMateriales.mockReturnValueOnce(of(materiales));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.mis-materiales__row').length).toBe(3);
  });

  it('no consulta con sesión inválida y limpia los datos al cerrar sesión', async () => {
    respuesta.next(materiales);
    respuesta.complete();
    await fixture.whenStable();
    fixture.detectChanges();
    auth.cerrarSesion();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Álgebra lineal');
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent)
      .toContain('Inicia sesión');
    expect(obtenerMisMateriales).toHaveBeenCalledOnce();
  });

  it('traduce etiquetas de estado y controles a inglés', async () => {
    respuesta.next(materiales);
    respuesta.complete();
    await fixture.whenStable();
    language.setLanguage('en');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toBe('My materials');
    expect(fixture.nativeElement.textContent).toContain('Rejected');
    expect(fixture.nativeElement.querySelector('label')?.textContent).toBe('Search by title');
  });
});

describe('utilidades de Mis materiales', () => {
  const materiales: MaterialEstudiante[] = [
    { id: 1, titulo: 'Álgebra lineal', nombreMateria: 'Matemática I', tipo: 'PDF', estado: 'PENDIENTE' },
    { id: 2, titulo: 'Cálculo diferencial', nombreMateria: 'Cálculo I', tipo: 'WORD', estado: 'APROBADO' },
    { id: 3, titulo: 'Álgebra avanzada', nombreMateria: 'Matemática II', tipo: 'IMAGEN', estado: 'NEGADO' }
  ];

  it('filtra por texto del título y estado sin modificar la lista original', () => {
    const resultado = filtrarMateriales(materiales, ' algebra ', 'NEGADO');
    expect(resultado.map(material => material.id)).toEqual([3]);
    expect(materiales).toHaveLength(3);
  });

  it.each<[
    EstadoRevisionMaterial,
    string
  ]>([
    ['PENDIENTE', 'pendiente'],
    ['APROBADO', 'aprobado'],
    ['NEGADO', 'rechazado']
  ])('mapea %s a su estado visual %s', (estado, esperado) => {
    expect(estadoVisualMaterial(estado)).toBe(esperado);
  });
});
