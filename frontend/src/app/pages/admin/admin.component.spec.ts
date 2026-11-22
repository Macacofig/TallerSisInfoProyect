import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SolicitudMaterialResponse } from '../../models/solicitud-material.model';
import { ApiService } from '../../services/api';
import { AyudantesService } from '../../services/ayudantes.service';
import { LanguageService } from '../../services/language.service';
import { SolicitudMaterialAdminService } from '../../services/solicitud-material-admin.service';
import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;
  const pendientes: SolicitudMaterialResponse[] = [
    {
      id: 21,
      titulo: 'Tarea 3 — modelado de procesos',
      idEstudiante: 6,
      nombreEstudiante: 'Hugo Paz',
      idMaterial: 34,
      linkMaterial: 'https://storage.example/file.pdf',
      estado: 'PENDIENTE'
    },
    {
      id: 22,
      titulo: 'Segundo parcial 2025-2',
      idEstudiante: 7,
      nombreEstudiante: 'Nadia Lopez',
      idMaterial: 35,
      linkMaterial: 'https://storage.example/examen.pdf',
      estado: 'PENDIENTE'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [{
        provide: AyudantesService,
        useValue: {
          obtenerSolicitudesAyudantePendientes: vi.fn(() => of([])),
          aprobarSolicitudAyudante: vi.fn(() => of({})),
          rechazarSolicitudAyudante: vi.fn(() => of({})),
        },
      }, {
        provide: SolicitudMaterialAdminService,
        useValue: { obtenerPendientes: vi.fn(() => of(pendientes)) },
      }, {
        provide: ApiService,
        useValue: { descargarMaterial: vi.fn() },
      }],
    }).compileComponents();
    TestBed.inject(LanguageService).setLanguage('es');
    fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();
  });

  it('abre Administración en solicitudes de ayudantes', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.admin-tabs__button');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelector('app-solicitudes-ayudante-admin')).not.toBeNull();
  });

  it('muestra el componente de Material pendiente al seleccionar su pestaña', () => {
    const button = fixture.nativeElement.querySelectorAll('.admin-tabs__button')[0] as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-material-pendiente')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('2 documentos esperando revisión');
    expect(fixture.nativeElement.querySelector('app-solicitudes-ayudante-admin')).toBeNull();
  });
});
