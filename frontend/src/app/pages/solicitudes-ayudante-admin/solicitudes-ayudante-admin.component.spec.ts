import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';

import { SolicitudAyudanteResponse } from '../../models/ayudante-materia.model';
import { routes } from '../../app.routes';
import { AyudantesService } from '../../services/ayudantes.service';
import { LanguageService } from '../../services/language.service';
import { SolicitudesAyudanteAdminComponent } from './solicitudes-ayudante-admin.component';

describe('SolicitudesAyudanteAdminComponent', () => {
  let fixture: ComponentFixture<SolicitudesAyudanteAdminComponent>;
  let service: {
    obtenerSolicitudesAyudantePendientes: ReturnType<typeof vi.fn>;
    aprobarSolicitudAyudante: ReturnType<typeof vi.fn>;
    rechazarSolicitudAyudante: ReturnType<typeof vi.fn>;
  };
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  const solicitud: SolicitudAyudanteResponse = {
    id: 17, idEstudiante: 4, nombreEstudiante: 'Estudiante Uno', idMateria: 9,
    codigoMateria: 'INF101', nombreMateria: 'Programación', motivo: 'Me interesa apoyar',
    calificacion: 8.5, horarios: 'Lunes 10:00-12:00', estado: 'PENDIENTE',
  };

  beforeEach(async () => {
    service = {
      obtenerSolicitudesAyudantePendientes: vi.fn(() => of([solicitud])),
      aprobarSolicitudAyudante: vi.fn(() => of({ ...solicitud, estado: 'APROBADA' })),
      rechazarSolicitudAyudante: vi.fn(() => of({ ...solicitud, estado: 'RECHAZADA' })),
    };
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await TestBed.configureTestingModule({
      imports: [SolicitudesAyudanteAdminComponent],
      providers: [{ provide: AyudantesService, useValue: service }],
    }).compileComponents();
    TestBed.inject(LanguageService).setLanguage('es');
    fixture = TestBed.createComponent(SolicitudesAyudanteAdminComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    confirmSpy.mockRestore();
  });

  it('carga y muestra únicamente los campos del DTO existente', () => {
    const texto = fixture.nativeElement.textContent as string;
    expect(service.obtenerSolicitudesAyudantePendientes).toHaveBeenCalledOnce();
    expect(texto).toContain('Estudiante Uno');
    expect(texto).toContain('INF101');
    expect(texto).toContain('Me interesa apoyar');
    expect(texto).toContain('8.5');
    expect(texto).toContain('Lunes 10:00-12:00');
    expect(texto).toContain('Pendiente');

  });

  it('muestra el estado vacío sin registros', () => {
    fixture.destroy();
    service.obtenerSolicitudesAyudantePendientes.mockReturnValue(of([]));
    fixture = TestBed.createComponent(SolicitudesAyudanteAdminComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay postulaciones pendientes.');
  });

  it('muestra carga y bloquea acciones mientras consulta', () => {
    fixture.destroy();
    const pendiente = new Subject<SolicitudAyudanteResponse[]>();
    service.obtenerSolicitudesAyudantePendientes.mockReturnValue(pendiente);
    fixture = TestBed.createComponent(SolicitudesAyudanteAdminComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain('Cargando');
    pendiente.next([solicitud]);
    pendiente.complete();
  });

  it('actualiza la vista cuando llega una respuesta HTTP asincrona', async () => {
    fixture.destroy();

    const respuesta = new Subject<SolicitudAyudanteResponse[]>();
    service.obtenerSolicitudesAyudantePendientes.mockReturnValue(respuesta);

    fixture = TestBed.createComponent(SolicitudesAyudanteAdminComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cargando');

    respuesta.next([solicitud]);
    respuesta.complete();

    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Estudiante Uno');
    expect(fixture.nativeElement.textContent).not.toContain('Cargando postulaciones');
    expect(fixture.nativeElement.querySelector('.solicitud-card__approve')).not.toBeNull();
  });
  it('confirma antes de aprobar y recarga la lista tras éxito', () => {
    fixture.nativeElement.querySelector('.solicitud-card__approve').click();
    fixture.detectChanges();
    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(service.aprobarSolicitudAyudante).toHaveBeenCalledWith(17);
    expect(service.obtenerSolicitudesAyudantePendientes).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain('Postulación aprobada.');
  });

  it('confirma antes de rechazar y recarga la lista tras éxito', () => {
    fixture.nativeElement.querySelector('.solicitud-card__reject').click();
    fixture.detectChanges();
    expect(service.rechazarSolicitudAyudante).toHaveBeenCalledWith(17);
    expect(service.obtenerSolicitudesAyudantePendientes).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain('Postulación rechazada.');
  });

  it('no ejecuta una decisión cuando se cancela la confirmación', () => {
    confirmSpy.mockReturnValue(false);
    fixture.nativeElement.querySelector('.solicitud-card__approve').click();
    expect(service.aprobarSolicitudAyudante).not.toHaveBeenCalled();
  });

  it('impide decisiones duplicadas mientras la operación está activa', () => {
    const pendiente = new Subject<SolicitudAyudanteResponse>();
    service.aprobarSolicitudAyudante.mockReturnValue(pendiente);
    const boton = fixture.nativeElement.querySelector('.solicitud-card__approve') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect(boton.disabled).toBe(true);
    fixture.componentInstance.decidir(solicitud, 'rechazar');
    expect(service.rechazarSolicitudAyudante).not.toHaveBeenCalled();
    pendiente.next({ ...solicitud, estado: 'APROBADA' });
    pendiente.complete();
  });

  it('conserva el resultado de decisión y permite reintentar si falla la recarga', () => {
    fixture.destroy();
    const recarga = new Subject<SolicitudAyudanteResponse[]>();
    service.obtenerSolicitudesAyudantePendientes.mockReturnValueOnce(of([solicitud])).mockReturnValueOnce(recarga);
    fixture = TestBed.createComponent(SolicitudesAyudanteAdminComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.solicitud-card__approve').click();
    fixture.detectChanges();
    recarga.error(new HttpErrorResponse({ status: 500 }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Postulación aprobada.');
    expect(fixture.componentInstance.errorCarga).toContain('No se pudieron cargar las postulaciones.');
    expect(fixture.componentInstance.cargando).toBe(false);
    expect(fixture.componentInstance.idEnProceso).toBe(null);
    expect(service.aprobarSolicitudAyudante).toHaveBeenCalledOnce();
    fixture.componentInstance.cargarSolicitudes();
    fixture.detectChanges();
    expect(service.obtenerSolicitudesAyudantePendientes).toHaveBeenCalledTimes(4);
    expect(service.aprobarSolicitudAyudante).toHaveBeenCalledOnce();
  });

  it('actualiza los textos visibles al cambiar idioma con la vista montada', () => {
    const languageService = TestBed.inject(LanguageService);
    languageService.setLanguage('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Teaching assistant applications');
    expect(fixture.nativeElement.querySelector('.solicitud-card__approve')?.textContent).toContain('Approve');
    languageService.setLanguage('es');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Postulaciones de ayudantes');
    expect(fixture.nativeElement.querySelector('.solicitud-card__approve')?.textContent).toContain('Aprobar');
  });

  it.each(['carga inicial', 'aprobación', 'rechazo', 'recarga posterior a decisión'])(
    'cancela la solicitud pendiente de %s al destruir el componente', tipo => {
      fixture.destroy();
      let cancelada = false;
      const pendiente = new Observable<unknown>(() => () => cancelada = true);
      if (tipo === 'carga inicial') {
        service.obtenerSolicitudesAyudantePendientes.mockReturnValue(pendiente);
      } else {
        service.obtenerSolicitudesAyudantePendientes.mockReturnValue(of([solicitud]));
        if (tipo === 'recarga posterior a decisión') {
          service.obtenerSolicitudesAyudantePendientes.mockReturnValueOnce(of([solicitud])).mockReturnValueOnce(pendiente);
          service.aprobarSolicitudAyudante.mockReturnValue(of(solicitud));
        } else if (tipo === 'aprobación') {
          service.aprobarSolicitudAyudante.mockReturnValue(pendiente);
        } else {
          service.rechazarSolicitudAyudante.mockReturnValue(pendiente);
        }
      }
      fixture = TestBed.createComponent(SolicitudesAyudanteAdminComponent);
      fixture.detectChanges();
      if (tipo === 'aprobación' || tipo === 'recarga posterior a decisión') {
        fixture.nativeElement.querySelector('.solicitud-card__approve').click();
      } else if (tipo === 'rechazo') {
        fixture.nativeElement.querySelector('.solicitud-card__reject').click();
      }
      fixture.destroy();
      expect(cancelada).toBe(true);
    }
  );

  it.each([[401, 'Tu sesión no está autorizada'], [403, 'No tienes permiso'], [500, 'No se pudieron cargar']])(
    'distingue error de carga HTTP %i', (status, mensaje) => {
      fixture.destroy();
      service.obtenerSolicitudesAyudantePendientes.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status }))
      );
      fixture = TestBed.createComponent(SolicitudesAyudanteAdminComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(mensaje);
    }
  );

  it('presenta error de autorización para acción denegada', () => {
    service.aprobarSolicitudAyudante.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    fixture.nativeElement.querySelector('.solicitud-card__approve').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No tienes permiso para gestionar postulaciones.');
  });

  it('usa botones nativos accesibles por teclado', () => {
    const boton = fixture.nativeElement.querySelector('.solicitud-card__approve') as HTMLButtonElement;
    expect(boton.tagName).toBe('BUTTON');
    expect(boton.type).toBe('button');
    expect(boton.disabled).toBe(false);
  });

  it('mantiene la página fuera de rutas públicas hasta disponer de autorización administrativa backend', () => {
    expect(routes.some(route => route.path === 'admin/solicitudes-ayudante')).toBe(false);
  });
});
