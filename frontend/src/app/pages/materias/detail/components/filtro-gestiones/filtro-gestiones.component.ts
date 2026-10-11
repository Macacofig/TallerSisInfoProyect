import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  CalificacionMateriaPromedioResponse
} from '../../../../../models/calificacion-materia.model';

import {
  CalificacionesMateriaService
} from '../../../../../services/calificaciones-materia.service';

import { LanguageService } from '../../../../../services/language.service';
import { MESSAGES } from '../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../strings/materias/materias-ingles.messages';
import { formatearGestion } from '../../../../../utils/gestion.utils';

export type ModoFiltroGestiones =
  'gestion' |
  'rango';

export interface FiltroGestionesResultado {
  promedios: CalificacionMateriaPromedioResponse;
  descripcion: string;
  contexto:
    | { tipo: 'gestion'; gestion: string }
    | { tipo: 'rango'; desde: string; hasta: string };
}

type FiltroMensajeKey = keyof typeof MESSAGES;

@Component({
  selector: 'app-filtro-gestiones',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './filtro-gestiones.component.html',
  styleUrl: './filtro-gestiones.component.css'
})
export class FiltroGestionesComponent implements OnChanges {

  private readonly languageService = inject(LanguageService);

  get mensajes() {
    return this.languageService.getMessages(MESSAGES, MESSAGES_EN);
  }

  readonly formatearGestion = formatearGestion;

  @Input()
  gestiones: string[] = [];

  @Output()
  filtroAplicado =
    new EventEmitter<FiltroGestionesResultado>();

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

  error: FiltroMensajeKey | '' = '';

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

    this.filtrarAutomaticamente();
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

  filtrarAutomaticamente(): void {

    this.error =
      '';

    if (
      this.cargando
    ) {
      return;
    }

    if (
      this.modo === 'gestion'
    ) {

      this.filtrarPorGestion();

      return;
    }

    this.filtrarPorRango();
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

      this.error = 'CALIFICATION_FILTER_MANAGEMENT_REQUIRED';

      return;
    }

    this.cargando =
      true;

    this.calificacionesMateriaService
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

            descripcion:
              `${this.mensajes.CALIFICATION_FILTER_MANAGEMENT_CONTEXT} ${formatearGestion(this.gestionSeleccionada)}`,
            contexto: {
              tipo: 'gestion',
              gestion: this.gestionSeleccionada
            }
          });
        },

        error: (error: { status?: number }) => {

          this.cargando =
            false;

          this.error =
            error.status === 404
              ? 'CALIFICATION_FILTER_MANAGEMENT_EMPTY'
              : 'CALIFICATION_FILTER_MANAGEMENT_LOAD_ERROR';
        }

      });
  }

  private filtrarPorRango(): void {

    if (
      !this.gestionDesde ||
      !this.gestionHasta
    ) {

      this.error = 'CALIFICATION_FILTER_RANGE_REQUIRED';

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

      this.error = 'CALIFICATION_FILTER_RANGE_INVALID';

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

        next: (promedios: CalificacionMateriaPromedioResponse) => {

          this.cargando =
            false;

          this.filtroActivo =
            true;

          this.gestionAplicada =
            '';

          this.filtroAplicado.emit({

            promedios,

            descripcion:
              `${this.mensajes.CALIFICATION_FILTER_RANGE_CONTEXT} ${formatearGestion(this.gestionDesde)} ${this.mensajes.CALIFICATION_FILTER_RANGE_SEPARATOR} ${formatearGestion(this.gestionHasta)}`,
            contexto: {
              tipo: 'rango',
              desde: this.gestionDesde,
              hasta: this.gestionHasta
            }
          });
        },

        error: (error: { status?: number }) => {

          this.cargando =
            false;

          this.error =
            error.status === 404
              ? 'CALIFICATION_FILTER_RANGE_EMPTY'
              : 'CALIFICATION_FILTER_RANGE_LOAD_ERROR';
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
