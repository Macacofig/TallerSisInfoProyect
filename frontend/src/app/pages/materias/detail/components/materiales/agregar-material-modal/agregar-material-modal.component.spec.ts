import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AgregarMaterialModalComponent } from './agregar-material-modal.component';
import { ApiService } from '../../../../../../services/api';
import { MateriasService } from '../../../../../../services/materias.service';
import { DocentesService } from '../../../../../../services/docentes.service';
import { AuthService } from '../../../../../../services/auth.service';
import { LanguageService } from '../../../../../../services/language.service';
import { MESSAGES } from '../../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../../strings/materias/materias-ingles.messages';
import { LoginResponse } from '../../../../../../models/login';

const ID_MATERIA = 3;

const MATERIAS = [
  { id: 3, codigo: 'sis-101', nombre: 'Programación I', carrera: 'Sistemas', semestre: 2 },
  { id: 7, codigo: 'mat-201', nombre: 'Matemática II', carrera: 'Sistemas', semestre: 4 }
];

const DOCENTES = [
  { id: 9, nombre: 'Carlos Gómez', idMateria: 3 },
  { id: 10, nombre: 'Ana Pérez', idMateria: 3 }
];

const api = {
  subirMaterial: vi.fn((fd: FormData) => of({} as never))
};

const materiasService = {
  obtenerMaterias: vi.fn(() => of(MATERIAS))
};

const docentesService = {
  obtenerPorMateria: vi.fn(() => of(DOCENTES))
};

const authService = {
  obtenerUsuario: vi.fn(() =>
    ({
      id: 5,
      nombre: 'Estudiante Prueba',
      telefono: '',
      correoElectronico: 'e@test.com',
      carrera: ''
    } as LoginResponse)
  )
};

describe('AgregarMaterialModalComponent', () => {
  let fixture: ComponentFixture<AgregarMaterialModalComponent>;
  let component: AgregarMaterialModalComponent;
  let language: LanguageService;

  const abrirModal = () => {
    fixture.componentRef.setInput('abierto', true);
    fixture.detectChanges();
  };

  const seleccionarArchivo = (nombre: string, tipo = 'pdf', tamano = 1024) => {
    const archivo = new File(['contenido'], nombre, { type: `application/${tipo}` });
    Object.defineProperty(archivo, 'size', { value: tamano });
    const input = fixture.nativeElement.querySelector('#modal-archivo') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [archivo] });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };

  const rellenarFormularioValido = () => {
    const materiaSelect = fixture.nativeElement.querySelector('#modal-materia') as HTMLSelectElement;
    materiaSelect.value = String(ID_MATERIA);
    materiaSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const docenteSelect = fixture.nativeElement.querySelector('#modal-docente') as HTMLSelectElement;
    docenteSelect.value = String(DOCENTES[0].id);
    docenteSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const semestreSelect = fixture.nativeElement.querySelector('#modal-semestre') as HTMLSelectElement;
    semestreSelect.value = '2';
    semestreSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const tipoSelect = fixture.nativeElement.querySelector('#modal-tipo') as HTMLSelectElement;
    tipoSelect.value = 'PDF';
    tipoSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const tituloInput = fixture.nativeElement.querySelector('#modal-titulo') as HTMLInputElement;
    tituloInput.value = 'Primer parcial resuelto';
    tituloInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const descripcionTextarea = fixture.nativeElement.querySelector('#modal-descripcion') as HTMLTextAreaElement;
    descripcionTextarea.value = 'Soluciones del parcial.';
    descripcionTextarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    seleccionarArchivo('parcial.pdf');
  };

  beforeEach(async () => {
    api.subirMaterial.mockClear();
    await TestBed.configureTestingModule({
      imports: [AgregarMaterialModalComponent],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: MateriasService, useValue: materiasService },
        { provide: DocentesService, useValue: docentesService },
        { provide: AuthService, useValue: authService },
        { provide: LanguageService, useClass: LanguageService }
      ]
    }).compileComponents();

    language = TestBed.inject(LanguageService);
    language.setLanguage('es');
    fixture = TestBed.createComponent(AgregarMaterialModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('idMateria', ID_MATERIA);
    fixture.detectChanges();
  });

  afterEach(() => language.setLanguage('es'));

  it('se crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('abre el modal y muestra todos los campos obligatorios', () => {
    abrirModal();
    expect(component.abierto()).toBe(true);
    const dialogo = fixture.nativeElement.querySelector('.material-modal');
    expect(dialogo.getAttribute('role')).toBe('dialog');
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_MODAL_TITULO);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_MODAL_SUBTITULO);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_LABEL_MATERIA);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_LABEL_DOCENTE);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_LABEL_SEMESTRE);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_LABEL_TIPO);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_LABEL_TITULO);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_LABEL_DESCRIPCION);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_LABEL_ARCHIVO);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_BOTON_ENVIAR);
    const cerrar = fixture.nativeElement.querySelector('.material-modal__cerrar');
    expect(cerrar).toBeTruthy();
  });

  it('cierra el modal y emite cerrar', () => {
    const cerrar = vi.fn();
    component.cerrar.subscribe(cerrar);
    abrirModal();
    component.cerrarModal();
    expect(cerrar).toHaveBeenCalledOnce();
    expect(component.exito()).toBe(false);
    expect(component.enviando()).toBe(false);
  });

  it('preselecciona la materia recibida por entrada', () => {
    abrirModal();
    const materiaSelect = fixture.nativeElement.querySelector('#modal-materia') as HTMLSelectElement;
    expect(materiaSelect.value).toBe(String(ID_MATERIA));
  });

  it('carga docentes de la materia seleccionada', () => {
    abrirModal();
    expect(docentesService.obtenerPorMateria).toHaveBeenCalledWith(ID_MATERIA);
    const docenteSelect = fixture.nativeElement.querySelector('#modal-docente') as HTMLSelectElement;
    expect(docenteSelect.options.length).toBeGreaterThan(1);
  });

  it('preselecciona el semestre de la materia cuando es válido', () => {
    abrirModal();
    const semestreSelect = fixture.nativeElement.querySelector('#modal-semestre') as HTMLSelectElement;
    expect(semestreSelect.value).toBe('2');
  });

  it('no envía cuando el formulario está vacío y marca los campos tocados', () => {
    abrirModal();
    const boton = fixture.nativeElement.querySelector('.material-modal__boton-enviar') as HTMLButtonElement;
    expect(boton.disabled).toBe(true);
    component.enviar();
    fixture.detectChanges();
    expect(api.subirMaterial).not.toHaveBeenCalled();
    expect(component.formulario.get('titulo')?.touched).toBe(true);
    expect(component.formulario.get('descripcion')?.touched).toBe(true);
    expect(component.formulario.get('archivo')?.touched).toBe(true);
  });

  it('rechaza título con solo espacios', () => {
    abrirModal();
    const tituloInput = fixture.nativeElement.querySelector('#modal-titulo') as HTMLInputElement;
    tituloInput.value = '   ';
    tituloInput.dispatchEvent(new Event('input'));
    tituloInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.formulario.get('titulo')?.invalid).toBe(true);
  });

  it('rechaza descripción con solo espacios', () => {
    abrirModal();
    const descripcionTextarea = fixture.nativeElement.querySelector('#modal-descripcion') as HTMLTextAreaElement;
    descripcionTextarea.value = '   ';
    descripcionTextarea.dispatchEvent(new Event('input'));
    descripcionTextarea.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.formulario.get('descripcion')?.invalid).toBe(true);
  });

  it('rechaza archivo con extensión no permitida', () => {
    abrirModal();
    seleccionarArchivo('documento.exe', 'exe', 1024);
    expect(component.formulario.get('archivo')?.errors?.['extension']).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_ERROR_EXTENSION_NO_PERMITIDA);
  });

  it('rechaza archivo vacío', () => {
    abrirModal();
    const archivo = new File([], 'vacío.pdf', { type: 'application/pdf' });
    Object.defineProperty(archivo, 'size', { value: 0 });
    const input = fixture.nativeElement.querySelector('#modal-archivo') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [archivo] });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.formulario.get('archivo')?.errors?.['vacio']).toBe(true);
  });

  it('rechaza archivo que excede el tamaño máximo', () => {
    abrirModal();
    seleccionarArchivo('grande.pdf', 'pdf', 25 * 1024 * 1024);
    expect(component.formulario.get('archivo')?.errors?.['tamaño']).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_ERROR_TAMANIO_EXCEDIDO);
  });

  it('rechaza combinación inconsistente de tipo y archivo', () => {
    abrirModal();
    rellenarFormularioValido();
    // Forzar tipo inconsistente con el archivo PDF
    const tipoSelect = fixture.nativeElement.querySelector('#modal-tipo') as HTMLSelectElement;
    tipoSelect.value = 'WORD';
    tipoSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.esTipoInconsistente()).toBe(true);
    const boton = fixture.nativeElement.querySelector('.material-modal__boton-enviar') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect(api.subirMaterial).not.toHaveBeenCalled();
    expect(component.errorGeneral()).toBe(MESSAGES.MATERIAL_ERROR_TIPO_ARCHIVO_INCONSISTENTE);
  });

  it('envía FormData con los campos correctos y sin tipo ni estado', () => {
    abrirModal();
    rellenarFormularioValido();
    const boton = fixture.nativeElement.querySelector('.material-modal__boton-enviar') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect(api.subirMaterial).toHaveBeenCalledOnce();
    const formData = api.subirMaterial.mock.calls[0][0];
    expect(formData.get('documento')).toBeInstanceOf(File);
    expect(formData.get('titulo')).toBe('Primer parcial resuelto');
    expect(formData.get('descripcion')).toBe('Soluciones del parcial.');
    expect(formData.get('idMateria')).toBe(String(ID_MATERIA));
    expect(formData.get('idDocente')).toBe(String(DOCENTES[0].id));
    expect(formData.get('semestreIngresado')).toBe('2');
    expect(formData.get('idEstudiante')).toBe('5');
    expect(formData.get('tipo')).toBeNull();
    expect(formData.get('estado')).toBeNull();
  });

  it('usa el id del estudiante autenticado de la sesión', () => {
    abrirModal();
    rellenarFormularioValido();
    const boton = fixture.nativeElement.querySelector('.material-modal__boton-enviar') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect(authService.obtenerUsuario).toHaveBeenCalled();
    const formData = api.subirMaterial.mock.calls[0][0];
    expect(formData.get('idEstudiante')).toBe('5');
  });

  it('no envía si no hay sesión válida', () => {
    authService.obtenerUsuario.mockReturnValueOnce(null as unknown as LoginResponse);
    abrirModal();
    rellenarFormularioValido();
    const boton = fixture.nativeElement.querySelector('.material-modal__boton-enviar') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect(api.subirMaterial).not.toHaveBeenCalled();
    expect(component.errorGeneral()).toBe(MESSAGES.MATERIAL_ERROR_SIN_SESION);
  });

  it('muestra confirmación de éxito tras respuesta 201 y cierra el envío', () => {
    api.subirMaterial.mockReturnValue(of({} as never));
    abrirModal();
    rellenarFormularioValido();
    const boton = fixture.nativeElement.querySelector('.material-modal__boton-enviar') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect(component.enviando()).toBe(false);
    expect(component.exito()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES.MATERIAL_EXITO);
  });

  it('no muestra éxito cuando el backend falla', () => {
    api.subirMaterial.mockReturnValue(throwError(() => ({ status: 500 })));
    abrirModal();
    rellenarFormularioValido();
    const boton = fixture.nativeElement.querySelector('.material-modal__boton-enviar') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect(component.exito()).toBe(false);
    expect(component.errorGeneral()).toBeTruthy();
  });

  it('evita envíos duplicados mientras está cargando', () => {
    let emisiones = 0;
    api.subirMaterial.mockReturnValue(new Observable((suscriptor) => {
      emisiones++;
      suscriptor.next({} as never);
      suscriptor.complete();
    }));
    abrirModal();
    rellenarFormularioValido();
    const boton = fixture.nativeElement.querySelector('.material-modal__boton-enviar') as HTMLButtonElement;
    boton.click();
    boton.click();
    fixture.detectChanges();
    expect(api.subirMaterial).toHaveBeenCalledTimes(1);
  });

  it('muestra estado de carga durante el envío', () => {
    let resolver: (() => void) | null = null;
    const obs = new Observable<never>((suscriptor) => {
      resolver = () => suscriptor.complete();
    });
    api.subirMaterial.mockReturnValue(obs);
    abrirModal();
    rellenarFormularioValido();
    const boton = fixture.nativeElement.querySelector('.material-modal__boton-enviar') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect(component.enviando()).toBe(true);
    resolver!();
    fixture.detectChanges();
  });

  it('alternar al inglés conserva las selecciones y traduce etiquetas', () => {
    abrirModal();
    language.setLanguage('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(MESSAGES_EN.MATERIAL_MODAL_TITULO);
    expect(fixture.nativeElement.textContent).toContain(MESSAGES_EN.MATERIAL_LABEL_MATERIA);
  });
});
