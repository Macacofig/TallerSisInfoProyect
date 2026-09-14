import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import {
  catchError,
  forkJoin,
  map,
  of
} from 'rxjs';

import {
  CalificacionMateriaPromedioResponse
} from '../../../../models/calificacion-materia.model';

import {
  CalificacionesMateriaService
} from '../../../../services/calificaciones-materia.service';

type MetricaHistorial =
  'dificultad' |
  'carga' |
  'conocimiento';

interface HistorialGestion {
  gestion: string;
  dificultad: number;
  carga: number;
  conocimiento: number;
}

@Component({
  selector: 'app-historial-calificaciones',
  standalone: true,
  imports: [],
  templateUrl: './historial-calificaciones.component.html',
  styleUrl: './historial-calificaciones.component.scss'
})
export class HistorialCalificacionesComponent
  implements OnChanges {

  @Input()
  gestiones: string[] = [];

  readonly anchoGrafico = 1000;
  readonly altoGrafico = 280;

  readonly margenIzquierdo = 55;
  readonly margenDerecho = 25;
  readonly margenSuperior = 20;
  readonly margenInferior = 45;

  readonly niveles = [
    0,
    2,
    4,
    6,
    8,
    10
  ];

  datos: HistorialGestion[] = [];

  cargando = false;
  error = '';

  constructor(
    private readonly calificacionesMateriaService:
      CalificacionesMateriaService,
    private readonly changeDetectorRef:
      ChangeDetectorRef
  ) {}

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['gestiones'] &&
      this.gestiones.length > 0
    ) {
      this.cargarHistorial();
    }
  }

  obtenerPuntos(
    metrica: MetricaHistorial
  ): string {

    return this.datos
      .map(
        (dato, indice) =>
          `${this.obtenerX(indice)},${this.obtenerY(
            this.obtenerValor(
              dato,
              metrica
            )
          )}`
      )
      .join(' ');
  }

  obtenerX(
    indice: number
  ): number {

    if (this.datos.length <= 1) {
      return this.anchoGrafico / 2;
    }

    const anchoDisponible =
      this.anchoGrafico -
      this.margenIzquierdo -
      this.margenDerecho;

    return (
      this.margenIzquierdo +
      (
        anchoDisponible /
        (this.datos.length - 1)
      ) *
      indice
    );
  }

  obtenerY(
    valor: number
  ): number {

    const altoDisponible =
      this.altoGrafico -
      this.margenSuperior -
      this.margenInferior;

    return (
      this.margenSuperior +
      altoDisponible -
      (
        valor / 10
      ) *
      altoDisponible
    );
  }

  obtenerValor(
    dato: HistorialGestion,
    metrica: MetricaHistorial
  ): number {

    switch (metrica) {

      case 'dificultad':
        return dato.dificultad;

      case 'carga':
        return dato.carga;

      default:
        return dato.conocimiento;
    }
  }

  obtenerPromedioFormateado(
    promedio: number
  ): string {

    return promedio.toFixed(1);
  }

  private cargarHistorial(): void {

    this.cargando = true;
    this.error = '';
    this.datos = [];

    const consultas =
      this.gestiones.map(
        (gestion) =>
          this.calificacionesMateriaService
            .obtenerPromediosPorGestion(
              gestion
            )
            .pipe(

              map(
                (
                  promedios:
                    CalificacionMateriaPromedioResponse
                ) => ({
                  gestion,
                  promedios
                })
              ),

              catchError(
                () =>
                  of({
                    gestion,
                    promedios: null
                  })
              )

            )
      );

    forkJoin(
      consultas
    )
      .subscribe({

        next: (resultados) => {

          this.datos =
            resultados
              .filter(
                (
                  resultado
                ): resultado is {
                  gestion: string;
                  promedios:
                    CalificacionMateriaPromedioResponse;
                } =>
                  resultado.promedios !== null
              )
              .map(
                (resultado) => ({

                  gestion:
                    resultado.gestion,

                  dificultad:
                    resultado.promedios
                      .dificultadPromedio,

                  carga:
                    resultado.promedios
                      .cargaPromedio,

                  conocimiento:
                    resultado.promedios
                      .conocimientoPrevioPromedio

                })
              );

          this.cargando = false;

          this.changeDetectorRef
            .markForCheck();
        },

        error: () => {

          this.cargando = false;

          this.error =
            'No se pudo cargar el historial de calificaciones.';

          this.changeDetectorRef
            .markForCheck();
        }

      });
  }
}