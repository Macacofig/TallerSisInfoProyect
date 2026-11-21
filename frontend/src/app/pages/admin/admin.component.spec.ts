import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AyudantesService } from '../../services/ayudantes.service';
import { LanguageService } from '../../services/language.service';
import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;

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

  it('muestra el estado de preparación de Material pendiente', () => {
    const button = fixture.nativeElement.querySelectorAll('.admin-tabs__button')[0] as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'La revisión de material pendiente estará disponible próximamente.'
    );
    expect(fixture.nativeElement.querySelector('app-solicitudes-ayudante-admin')).toBeNull();
  });
});
