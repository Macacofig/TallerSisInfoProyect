import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  forkJoin
} from 'rxjs';

import {
  CalificacionMateriaPromedioResponse
} from '../../../../../../models/calificacion-materia.model';

import {
  CalificacionesMateriaService
} from '../../../../../../services/calificaciones-materia.service';

import { MESSAGES } from '../../../../../../strings/materias/materias.messages';

export type ModoFiltroGestiones =
  'gestion' |
  'rango';

export interface FiltroGestionesResultado {
  promedios: CalificacionMateriaPromedioResponse | null;
  descripcion: string;
  error?: string;
}

export interface FiltroGestionesConsulta {
  gestion: string | null;
  descripcion: string;
}

@Component({
  selector: 'app-filtro-gestiones',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './filtro-gestiones.component.html',
  styleUrl: './filtro-gestiones.component.scss'
})
export class FiltroGestionesComponent implements OnChanges {

  readonly mensajes = MESSAGES;

  @Input()
  gestiones: string[] = [];

  @Input({
    required: true
  })
  idMateria!: number;

  @Output()
  filtroIniciado =
    new EventEmitter<FiltroGestionesConsulta>();

  @Output()
  filtroAplicado =
    new EventEmitter<FiltroGestionesResultado>();

  @Output()
  filtroLimpiado =
    new EventEmitter<void>();

  modo: ModoFiltroGestiones =
    'gestion';

  gestionSeleccionada =
    '';

  gestionDesde =
    '';

  gestionHasta =
    '';

  gestionAplicada =
    '';

  cargando =
    false;

  filtroActivo =
    false;

  error =
    '';

  constructor(
    private readonly calificacionesMateriaService:
      CalificacionesMateriaService
  ) {}

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['gestiones'] &&
      this.gestiones.length > 0 &&
      this.idMateria > 0
    ) {

      this.inicializarGestiones();

    } else if (
      changes['idMateria'] &&
      this.gestiones.length > 0 &&
      this.idMateria > 0
    ) {

      this.inicializarGestiones();
    }
  }

  get gestionesRapidas(): string[] {

    return [...this.gestiones]
      .reverse()
      .slice(0, 4);
  }

  cambiarModo(
    modo: ModoFiltroGestiones
  ): void {

    this.modo =
      modo;

    this.error =
      '';
  }

  seleccionarGestionRapida(
    gestion: string
  ): void {

    if (this.cargando) {
      return;
    }

    this.modo =
      'gestion';

    this.gestionSeleccionada =
      gestion;

    this.error =
      '';

    this.filtrarPorGestion();
  }

  aplicarFiltro(): void {

    this.error =
      '';

    if (
      this.modo === 'gestion'
    ) {

      this.filtrarPorGestion();

      return;
    }

    this.filtrarPorRango();
  }

  limpiarFiltro(): void {

    this.error =
      '';

    this.filtroActivo =
      false;

    this.gestionAplicada =
      '';

    this.filtroLimpiado.emit();

    if (this.gestiones.length > 0) {

      this.gestionSeleccionada =
        this.gestiones[
          this.gestiones.length - 1
        ];

      this.filtrarPorGestion();
    }
  }

  esGestionActiva(
    gestion: string
  ): boolean {

    return (
      this.filtroActivo &&
      this.modo === 'gestion' &&
      this.gestionAplicada === gestion
    );
  }

  private filtrarPorGestion(): void {

    if (
      !this.gestionSeleccionada
    ) {

      this.error =
        MESSAGES.CALIFICATION_FILTER_MANAGEMENT_REQUIRED;

      return;
    }

    this.cargando =
      true;

    const descripcion =
      `${MESSAGES.CALIFICATION_FILTER_MANAGEMENT_CONTEXT} ${this.gestionSeleccionada}`;

    this.filtroIniciado.emit({
      gestion: this.gestionSeleccionada,
      descripcion
    });

    this.calificacionesMateriaService
      .obtenerPromediosPorMateriaYGestion(
        this.idMateria,
        this.gestionSeleccionada
      )
      .subscribe({

        next: (promedios: CalificacionMateriaPromedioResponse) => {

          this.cargando =
            false;

          this.filtroActivo =
            true;

          this.gestionAplicada =
            this.gestionSeleccionada;

          this.filtroAplicado.emit({

            promedios,
            descripcion
          });
        },

        error: (error: { status?: number }) => {

          this.cargando =
            false;

          this.error =
            error.status === 404
              ? MESSAGES.CALIFICATION_FILTER_MANAGEMENT_EMPTY
              : MESSAGES.CALIFICATION_FILTER_MANAGEMENT_LOAD_ERROR;

          this.filtroAplicado.emit({
            promedios: null,
            descripcion,
            error: this.error
          });
        }

      });
  }

  private filtrarPorRango(): void {

    if (
      !this.gestionDesde ||
      !this.gestionHasta
    ) {

      this.error =
        MESSAGES.CALIFICATION_FILTER_RANGE_REQUIRED;

      return;
    }

    if (
      this.obtenerIndiceGestion(
        this.gestionDesde
      ) >
      this.obtenerIndiceGestion(
        this.gestionHasta
      )
    ) {

      this.error =
        MESSAGES.CALIFICATION_FILTER_RANGE_INVALID;

      return;
    }

    const indiceDesde =
      this.obtenerIndiceGestion(this.gestionDesde);

    const indiceHasta =
      this.obtenerIndiceGestion(this.gestionHasta);

    const gestionesSeleccionadas =
      this.gestiones.slice(
        indiceDesde,
        indiceHasta + 1
      );

    const descripcion =
      `${MESSAGES.CALIFICATION_FILTER_RANGE_CONTEXT} ${this.gestionDesde} ${MESSAGES.CALIFICATION_FILTER_RANGE_SEPARATOR} ${this.gestionHasta}`;

    this.cargando =
      true;

    this.filtroIniciado.emit({
      gestion: null,
      descripcion
    });

    forkJoin(
      gestionesSeleccionadas.map(
        (gestion) =>
          this.calificacionesMateriaService
            .obtenerPromediosPorMateriaYGestion(
              this.idMateria,
              gestion
            )
      )
    ).subscribe({

      next: (resultados) => {

        const utilizables =
          resultados.filter(
            (resultado) =>
              resultado.informacionSuficiente !== false &&
              resultado.dificultadPromedio !== null &&
              resultado.cargaPromedio !== null &&
              resultado.conocimientoPrevioPromedio !== null
          );

        const faltaConteo =
          resultados.some(
            (resultado) =>
              resultado.cantidadEvaluaciones == null
          );

        if (faltaConteo && utilizables.length > 0) {

          this.finalizarErrorRango(
            MESSAGES.CALIFICATION_FILTER_RANGE_COUNT_UNAVAILABLE,
            descripcion
          );

          return;
        }

        const cantidadEvaluaciones =
          resultados.reduce(
            (total, resultado) =>
              total + (resultado.cantidadEvaluaciones ?? 0),
            0
          );

        const pesoTotal =
          utilizables.reduce(
            (total, resultado) =>
              total + (resultado.cantidadEvaluaciones ?? 0),
            0
          );

        const promedios: CalificacionMateriaPromedioResponse = {
          idMateria: this.idMateria,
          gestionDesde: this.gestionDesde,
          gestionHasta: this.gestionHasta,
          dificultadPromedio: this.calcularPromedioPonderado(
            utilizables,
            'dificultadPromedio',
            pesoTotal
          ),
          cargaPromedio: this.calcularPromedioPonderado(
            utilizables,
            'cargaPromedio',
            pesoTotal
          ),
          conocimientoPrevioPromedio: this.calcularPromedioPonderado(
            utilizables,
            'conocimientoPrevioPromedio',
            pesoTotal
          ),
          cantidadEvaluaciones:
            faltaConteo
              ? null
              : cantidadEvaluaciones,
          informacionSuficiente:
            resultados.length > 0 &&
            resultados.every(
              (resultado) =>
                resultado.informacionSuficiente === false
            )
              ? false
              : undefined
        };

        this.cargando =
          false;

        this.filtroActivo =
          true;

        this.gestionAplicada =
          '';

        this.filtroAplicado.emit({
          promedios,
          descripcion
        });
      },

      error: (error: { status?: number }) => {

        this.finalizarErrorRango(
          error.status === 404
            ? MESSAGES.CALIFICATION_FILTER_RANGE_EMPTY
            : MESSAGES.CALIFICATION_FILTER_RANGE_LOAD_ERROR,
          descripcion
        );
      }
    });
  }

  private calcularPromedioPonderado(
    respuestas: CalificacionMateriaPromedioResponse[],
    metrica:
      | 'dificultadPromedio'
      | 'cargaPromedio'
      | 'conocimientoPrevioPromedio',
    pesoTotal: number
  ): number | null {

    if (pesoTotal === 0) {
      return null;
    }

    return respuestas.reduce(
      (total, respuesta) =>
        total +
        (respuesta[metrica] ?? 0) *
        (respuesta.cantidadEvaluaciones ?? 0),
      0
    ) / pesoTotal;
  }

  private finalizarErrorRango(
    mensaje: string,
    descripcion: string
  ): void {

    this.cargando =
      false;

    this.error =
      mensaje;

    this.filtroAplicado.emit({
      promedios: null,
      descripcion,
      error: mensaje
    });
  }

  private inicializarGestiones(): void {

    const ultimaGestion =
      this.gestiones[
        this.gestiones.length - 1
      ];

    this.gestionSeleccionada =
      ultimaGestion;

    this.gestionHasta =
      ultimaGestion;

    this.gestionDesde =
      this.gestiones.length > 1
        ? this.gestiones[
            this.gestiones.length - 2
          ]
        : ultimaGestion;

    this.filtrarPorGestion();
  }

  private obtenerIndiceGestion(
    gestion: string
  ): number {

    return this.gestiones.indexOf(
      gestion
    );
  }
}