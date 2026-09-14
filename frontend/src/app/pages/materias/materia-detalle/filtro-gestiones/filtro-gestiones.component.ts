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
  CalificacionMateriaPromedioResponse
} from '../../../../models/calificacion-materia.model';

import {
  CalificacionesMateriaService
} from '../../../../services/calificaciones-materia.service';

import {
  MESSAGES
} from '../../../../strings';

export type ModoFiltroGestiones =
  'gestion' |
  'rango';

export interface FiltroGestionesResultado {
  promedios: CalificacionMateriaPromedioResponse;
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
      this.gestiones.length > 0
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

    this.calificacionesMateriaService
      .obtenerPromediosPorGestion(
        this.gestionSeleccionada
      )
      .subscribe({

        next: (promedios) => {

          this.cargando =
            false;

          this.filtroActivo =
            true;

          this.gestionAplicada =
            this.gestionSeleccionada;

          this.filtroAplicado.emit({

            promedios,

            descripcion:
              `${MESSAGES.CALIFICATION_FILTER_MANAGEMENT_CONTEXT} ${this.gestionSeleccionada}`
          });
        },

        error: (error) => {

          this.cargando =
            false;

          this.error =
            error.status === 404
              ? MESSAGES.CALIFICATION_FILTER_MANAGEMENT_EMPTY
              : MESSAGES.CALIFICATION_FILTER_MANAGEMENT_LOAD_ERROR;
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

    this.cargando =
      true;

    this.calificacionesMateriaService
      .obtenerPromediosPorRango(
        this.gestionDesde,
        this.gestionHasta
      )
      .subscribe({

        next: (promedios) => {

          this.cargando =
            false;

          this.filtroActivo =
            true;

          this.gestionAplicada =
            '';

          this.filtroAplicado.emit({

            promedios,

            descripcion:
              `${MESSAGES.CALIFICATION_FILTER_RANGE_CONTEXT} ${this.gestionDesde} ${MESSAGES.CALIFICATION_FILTER_RANGE_SEPARATOR} ${this.gestionHasta}`
          });
        },

        error: (error) => {

          this.cargando =
            false;

          this.error =
            error.status === 404
              ? MESSAGES.CALIFICATION_FILTER_RANGE_EMPTY
              : MESSAGES.CALIFICATION_FILTER_RANGE_LOAD_ERROR;
        }

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
  }

  private obtenerIndiceGestion(
    gestion: string
  ): number {

    return this.gestiones.indexOf(
      gestion
    );
  }
}