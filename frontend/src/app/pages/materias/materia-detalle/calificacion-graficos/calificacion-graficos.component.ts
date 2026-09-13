import {
  Component,
  Input
} from '@angular/core';

import {
  CalificacionMateriaPromedioResponse
} from '../../../../models/calificacion-materia.model';

@Component({
  selector: 'app-calificacion-graficos',
  standalone: true,
  imports: [],
  templateUrl: './calificacion-graficos.component.html',
  styleUrl: './calificacion-graficos.component.scss'
})
export class CalificacionGraficosComponent {

  @Input({ required: true })
  promedios!: CalificacionMateriaPromedioResponse;

  @Input()
  contexto =
    'Promedio general de la materia';

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