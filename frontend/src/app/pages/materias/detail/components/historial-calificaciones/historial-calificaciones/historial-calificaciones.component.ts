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
} from '../../../../../../models/calificacion-materia.model';

import {
  CalificacionesMateriaService
} from '../../../../../../services/calificaciones-materia.service';

import { MESSAGES } from '../../../../../../strings/materias/materias.messages';

type MetricaHistorial =
  'dificultad' |
  'carga' |
  'conocimiento';

interface HistorialGestion {
  gestion: string;
  dificultad: number | null;
  carga: number | null;
  conocimiento: number | null;
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

  readonly mensajes = MESSAGES;

  @Input()
  gestiones: string[] = [];

  @Input({
    required: true
  })
  idMateria!: number;

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
      (changes['gestiones'] || changes['idMateria']) &&
      this.idMateria > 0
    ) {

      if (this.gestiones.length > 0) {
        this.cargarHistorial();
      } else {
        this.datos = [];
        this.error = '';
        this.cargando = false;
      }
    }
  }

  get hayDatosGraficables(): boolean {

    return this.datos.filter(
      (dato) =>
        this.esMetricaDisponible(
          dato,
          'dificultad'
        ) ||
        this.esMetricaDisponible(
          dato,
          'carga'
        ) ||
        this.esMetricaDisponible(
          dato,
          'conocimiento'
        )
    ).length > 1;
  }

  obtenerSegmentos(
    metrica: MetricaHistorial
  ): string[] {

    const segmentos: string[][] = [];
    let segmentoActual: string[] = [];

    this.datos.forEach(
      (dato, indice) => {

        const valor =
          this.obtenerValor(
            dato,
            metrica
          );

        if (valor === null) {

          if (
            segmentoActual.length > 1
          ) {
            segmentos.push(
              segmentoActual
            );
          }

          segmentoActual = [];
          return;
        }

        segmentoActual.push(
          `${this.obtenerX(indice)},${this.obtenerY(valor)}`
        );
      }
    );

    if (
      segmentoActual.length > 1
    ) {
      segmentos.push(
        segmentoActual
      );
    }

    return segmentos.map(
      (segmento) =>
        segmento.join(' ')
    );
  }

  esMetricaDisponible(
    dato: HistorialGestion,
    metrica: MetricaHistorial
  ): boolean {

    return this.obtenerValor(
      dato,
      metrica
    ) !== null;
  }

  obtenerPuntos(
    metrica: MetricaHistorial
  ): string {

    return this.datos
      .map(
        (dato, indice) => {

          const valor =
            this.obtenerValor(
              dato,
              metrica
            );

          if (valor === null) {
            return '';
          }

          return `${this.obtenerX(indice)},${this.obtenerY(valor)}`;
        }
      )
      .filter(
        (punto) =>
          punto !== ''
      )
      .join(' ');
  }

  obtenerX(
    indice: number
  ): number {

    if (
      this.datos.length <= 1
    ) {

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
    valor: number | null
  ): number {

    if (
      valor === null
    ) {
      return Number.NaN;
    }

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
  ): number | null {

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
    promedio: number | null
  ): string {

    return promedio === null
      ? '—'
      : promedio.toFixed(1);
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

        next: (
          resultados
        ) => {

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
                (
                  resultado
                ) => ({

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

          this.cargando =
            false;

          this.changeDetectorRef
            .markForCheck();
        },

        error: () => {

          this.cargando =
            false;

          this.error =
            MESSAGES.CALIFICATION_HISTORY_LOAD_ERROR;

          this.changeDetectorRef
            .markForCheck();
        }

      });
  }
}