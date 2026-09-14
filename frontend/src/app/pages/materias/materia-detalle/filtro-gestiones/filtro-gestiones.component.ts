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
  imports: [FormsModule],
  templateUrl: './filtro-gestiones.component.html',
  styleUrl: './filtro-gestiones.component.scss'
})
export class FiltroGestionesComponent implements OnChanges {

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

    if (this.modo === 'gestion') {

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

    if (!this.gestionSeleccionada) {

      this.error =
        'Selecciona una gestión.';

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
              `Promedio general de la gestión ${this.gestionSeleccionada}`
          });
        },

        error: (error) => {

          this.cargando =
            false;

          this.error =
            error.status === 404
              ? 'No existen calificaciones para la gestión seleccionada.'
              : 'No se pudieron cargar los datos de la gestión.';
        }

      });
  }

  private filtrarPorRango(): void {

    if (
      !this.gestionDesde ||
      !this.gestionHasta
    ) {

      this.error =
        'Selecciona la gestión inicial y final.';

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
        'La gestión inicial no puede ser posterior a la final.';

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
              `Promedio general del rango ${this.gestionDesde} a ${this.gestionHasta}`
          });
        },

        error: (error) => {

          this.cargando =
            false;

          this.error =
            error.status === 404
              ? 'No existen calificaciones para el rango seleccionado.'
              : 'No se pudieron cargar los datos del rango.';
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