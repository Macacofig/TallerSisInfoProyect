
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AyudantesService } from '../../../../../services/ayudantes.service';
import { LanguageService } from '../../../../../services/language.service';
import { AyudantesComponent } from './ayudantes.component';

describe('AyudantesComponent', () => {
  let component: AyudantesComponent;
  let fixture: ComponentFixture<AyudantesComponent>;

  const ayudantesServiceMock = {
    obtenerAprobadosPorMateria: vi.fn(() => of([
      {
        id: 8,
        idEstudiante: 2,
        nombreEstudiante: 'Ana Torres',
        idMateria: 25,
        codigoMateria: 'SIS-111',
        nombreMateria: 'Introducción a la programación',
        horario: 'Lun 16:00-18:00 · Mié 16:00-18:00',
        estado: 'APROBADO'
      }
    ])),
    solicitarAyuda: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AyudantesComponent],
      providers: [
        { provide: AyudantesService, useValue: ayudantesServiceMock }
      ]
    }).compileComponents();

    TestBed.inject(LanguageService).setLanguage('es');
    fixture = TestBed.createComponent(AyudantesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('idMateria', 25);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the approved assistants for the selected subject', () => {
    expect(ayudantesServiceMock.obtenerAprobadosPorMateria)
      .toHaveBeenCalledExactlyOnceWith(25);
    expect(component.ayudantes).toHaveLength(1);
  });

  it('displays the assistant name and schedule returned by the API', () => {
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain('Ana Torres');
    expect(compiled.textContent).toContain(
      'Lun 16:00-18:00 · Mié 16:00-18:00'
    );
  });

  it('shows that the rating is unavailable because the endpoint does not provide it', () => {
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain('Calificación no disponible');
  });
});
