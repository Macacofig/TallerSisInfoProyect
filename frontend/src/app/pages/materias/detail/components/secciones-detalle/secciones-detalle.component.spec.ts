import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  SeccionesDetalleComponent
} from './secciones-detalle.component';

describe('SeccionesDetalleComponent', () => {

  let component: SeccionesDetalleComponent;
  let fixture: ComponentFixture<SeccionesDetalleComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [
        SeccionesDetalleComponent
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        SeccionesDetalleComponent
      );

    component =
      fixture.componentInstance;

    component.seccionActiva =
      'resumen';

    fixture.detectChanges();
  });

  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra las cinco secciones disponibles', () => {

    const botones =
      fixture.nativeElement.querySelectorAll(
        'button'
      );

    expect(
      botones.length
    ).toBe(5);
  });

  it('marca como activa la seccion seleccionada', () => {

    const botonResumen:
      HTMLButtonElement =
      fixture.nativeElement.querySelector(
        'button'
      );

    expect(
      botonResumen.getAttribute(
        'aria-pressed'
      )
    ).toBe('true');
  });

  it('emite la nueva seccion al seleccionar otra', () => {

    let seccionEmitida:
      string | undefined;

    component
      .seccionSeleccionada
      .subscribe(
        (seccion) => {
          seccionEmitida = seccion;
        }
      );

    const botones:
      NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll(
        'button'
      );

    botones[1].click();

    expect(
      seccionEmitida
    ).toBe('docentes');
  });

  it('no vuelve a emitir si se selecciona la seccion ya activa', () => {

    let cantidadEmisiones = 0;

    component
      .seccionSeleccionada
      .subscribe(
        () => {
          cantidadEmisiones++;
        }
      );

    const botonResumen:
      HTMLButtonElement =
      fixture.nativeElement.querySelector(
        'button'
      );

    botonResumen.click();

    expect(
      cantidadEmisiones
    ).toBe(0);
  });
});