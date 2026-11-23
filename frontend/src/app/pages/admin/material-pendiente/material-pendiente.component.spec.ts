import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SolicitudMaterialResponse } from '../../../models/solicitud-material.model';
import { ApiService } from '../../../services/api';
import { LanguageService } from '../../../services/language.service';
import { SolicitudMaterialAdminService } from '../../../services/solicitud-material-admin.service';
import { MaterialPendienteComponent } from './material-pendiente.component';

describe('MaterialPendienteComponent', () => {
  let fixture: ComponentFixture<MaterialPendienteComponent>;
  let service: {
    obtenerPendientes: ReturnType<typeof vi.fn>;
    aprobar: ReturnType<typeof vi.fn>;
    rechazar: ReturnType<typeof vi.fn>;
    eliminar: ReturnType<typeof vi.fn>;
  };
  let api: { descargarMaterial: ReturnType<typeof vi.fn> };

  const solicitud: SolicitudMaterialResponse = {
    id: 21,
    titulo: 'Tarea 3 — modelado de procesos',
    materia: 'Ingeniería de Software',
    docente: 'Ana Pérez',
    usuario: 'Hugo Paz',
    tipo: 'PDF',
    idEstudiante: 6,
    nombreEstudiante: 'Hugo Paz',
    idMaterial: 34,
    linkMaterial: 'https://storage.example/file.pdf',
    estado: 'PENDIENTE'
  };

  beforeEach(async () => {
    service = {
      obtenerPendientes: vi.fn().mockReturnValue(of([solicitud])),
      aprobar: vi.fn().mockReturnValue(of(solicitud)),
      rechazar: vi.fn().mockReturnValue(of(solicitud)),
      eliminar: vi.fn().mockReturnValue(of(undefined))
    };
    api = {
      descargarMaterial: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MaterialPendienteComponent],
      providers: [
        { provide: SolicitudMaterialAdminService, useValue: service },
        { provide: ApiService, useValue: api }
      ]
    }).compileComponents();
    TestBed.inject(LanguageService).setLanguage('es');
    fixture = TestBed.createComponent(MaterialPendienteComponent);
    fixture.detectChanges();
  });

  afterEach(() => vi.restoreAllMocks());

  it('carga la lista real y muestra el conteo y el nombre del solicitante', () => {
    expect(service.obtenerPendientes).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('.material-pendiente__count')?.textContent)
      .toContain('1 documento esperando revisión');
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Tarea 3 — modelado de procesos');
    expect(fixture.nativeElement.textContent).toContain('Hugo Paz');
  });

  it('muestra el estado vacío cuando el servicio no devuelve documentos', () => {
    service.obtenerPendientes.mockReturnValueOnce(of([]));
    fixture.componentInstance.cargarDocumentos();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.material-pendiente__empty')?.textContent)
      .toContain('No hay documentos pendientes');
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(0);
  });

  it('muestra el error de carga sin ocultarlo', () => {
    service.obtenerPendientes.mockReturnValueOnce(throwError(() => new Error('offline')));
    fixture.componentInstance.cargarDocumentos();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('No se pudieron cargar');
  });

  it('confirma, aprueba y recarga la lista', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.componentInstance.aprobar(solicitud);

    expect(service.aprobar).toHaveBeenCalledWith(solicitud.id);
    expect(service.obtenerPendientes).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.mensajeAccion()).toBe('Documento aprobado.');
  });

  it('confirma y rechaza', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.componentInstance.rechazar(solicitud);

    expect(service.rechazar).toHaveBeenCalledWith(solicitud.id);
    expect(fixture.componentInstance.mensajeAccion()).toBe('Documento rechazado.');
  });

  it('confirma y elimina', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.componentInstance.eliminar(solicitud);

    expect(service.eliminar).toHaveBeenCalledWith(solicitud.id);
    expect(fixture.componentInstance.mensajeAccion()).toBe('Documento eliminado.');
  });

  it('descarga y abre la vista previa de un PDF', () => {
    const blob = new Blob(['document'], { type: 'application/pdf' });
    api.descargarMaterial.mockReturnValue(of(new HttpResponse({
      body: blob,
      headers: new HttpHeaders({ 'Content-Type': 'application/pdf' })
    })));
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => dialog.removeAttribute('open'));
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:material-preview');

    fixture.componentInstance.ver(solicitud);
    fixture.detectChanges();

    expect(api.descargarMaterial).toHaveBeenCalledWith(solicitud.idMaterial);
    expect(fixture.componentInstance.vistaPreviaTitulo()).toBe(solicitud.titulo);
    expect(fixture.componentInstance.vistaPreviaEsPdf()).toBe(true);
  });
});
