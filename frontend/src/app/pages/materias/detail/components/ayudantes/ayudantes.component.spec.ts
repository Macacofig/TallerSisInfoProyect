
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AyudantesComponent } from './ayudantes.component';

describe('AyudantesComponent', () => {
  let component: AyudantesComponent;
  let fixture: ComponentFixture<AyudantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AyudantesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AyudantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the assistants data', () => {
    expect(component.ayudantes).toBeDefined();
    expect(component.ayudantes.length).toBeGreaterThan(0);
  });

  it('should display the assistant name', () => {
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain('Ana Torres');
  });

  it('should display the assistant schedule', () => {
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain(
      'Lun 16:00-18:00 · Mié 16:00-18:00'
    );
  });

  it('should display the assistant rating', () => {
    const compiled: HTMLElement = fixture.nativeElement;

    expect(compiled.textContent).toContain('4.8/5');
  });
});
