import {
  Component,
  Input
} from '@angular/core';

import {
  CalificacionMateriaPromedioResponse
} from '../../../../../../models/calificacion-materia.model';

import { MESSAGES } from '../../../../../../strings/materias/materias.messages';

@Component({
  selector: 'app-calificacion-graficos',
  standalone: true,
  imports: [],
  templateUrl: './calificacion-graficos.component.html',
  styleUrl: './calificacion-graficos.component.scss'
})
export class CalificacionGraficosComponent {

  readonly mensajes = MESSAGES;

  @Input({ required: true })
  promedios!: CalificacionMateriaPromedioResponse;

  @Input()
  contexto: string =
    MESSAGES.CALIFICATION_SUMMARY_GENERAL_CONTEXT;

  obtenerPromedioFormateado(
    promedio: number
  ): string {

    return promedio.toFixed(1);
  }

  obtenerPorcentaje(
    promedio: number
  ): number {

    return Math.max(
      0,
      Math.min(
        100,
        promedio * 10
      )
    );
  }
}