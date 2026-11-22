import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageService } from '../../../services/language.service';
import { MaterialPendienteComponent } from './material-pendiente.component';

describe('MaterialPendienteComponent', () => {
  let fixture: ComponentFixture<MaterialPendienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialPendienteComponent]
    }).compileComponents();
    TestBed.inject(LanguageService).setLanguage('es');
    fixture = TestBed.createComponent(MaterialPendienteComponent);
    fixture.detectChanges();
  });

  it('muestra el conteo calculado y las dos filas del mock', () => {
    expect(fixture.nativeElement.querySelector('.material-pendiente__count')?.textContent)
      .toContain('2 documentos esperando revisión');
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('Tarea 3 — modelado de procesos');
    expect(fixture.nativeElement.textContent).toContain('Segundo parcial 2025-2');
  });
});
