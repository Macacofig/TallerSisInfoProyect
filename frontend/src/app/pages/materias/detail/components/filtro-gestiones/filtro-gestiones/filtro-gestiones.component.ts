import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Subscription
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
export class FiltroGestionesComponent implements OnChanges, OnDestroy {

  readonly mensajes = MESSAGES;

  @Input()
  gestiones: string[] = [];

  @Input()
  gestionInicial: string | null = null;

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

  private consultaActual?: Subscription;

  constructor(
    private readonly calificacionesMateriaService:
      CalificacionesMateriaService
  ) {}

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      (changes['gestiones'] || changes['gestionInicial']) &&
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

  seleccionarGestion(
    gestion: string
  ): void {

    if (this.cargando || !gestion) {
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

  ngOnDestroy(): void {

    this.consultaActual?.unsubscribe();
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
        this.gestiones.includes(this.gestionInicial ?? '')
          ? this.gestionInicial!
          : this.gestiones[
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

    this.consultaActual?.unsubscribe();

    this.consultaActual = this.calificacionesMateriaService
      .obtenerPromediosPorGestion(
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
              ? MESSAGES.CALIFICATION_INSUFFICIENT_INFORMATION
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

    const descripcion =
      `${MESSAGES.CALIFICATION_FILTER_RANGE_CONTEXT} ${this.gestionDesde} ${MESSAGES.CALIFICATION_FILTER_RANGE_SEPARATOR} ${this.gestionHasta}`;

    this.cargando =
      true;

    this.filtroIniciado.emit({
      gestion: null,
      descripcion
    });

    this.calificacionesMateriaService
      .obtenerPromediosPorRango(
        this.gestionDesde,
        this.gestionHasta
      )
      .subscribe({

        next: (promedios: CalificacionMateriaPromedioResponse) => {

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
            ? MESSAGES.CALIFICATION_INSUFFICIENT_INFORMATION
            : MESSAGES.CALIFICATION_FILTER_RANGE_LOAD_ERROR,
          descripcion
        );
      }
    });
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
      this.gestiones.includes(this.gestionInicial ?? '')
        ? this.gestionInicial!
        : this.gestiones[
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