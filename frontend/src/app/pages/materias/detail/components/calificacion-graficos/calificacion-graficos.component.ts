import {
  Component,
  Input,
  inject
} from '@angular/core';

import {
  CalificacionMateriaPromedioResponse
} from '../../../../../models/calificacion-materia.model';

import {
  LanguageService
} from '../../../../../services/language.service';

import {
  MESSAGES
} from '../../../../../strings/calificacion-graficos/calificacion-graficos.messages';

import {
  MESSAGES_EN
} from '../../../../../strings/calificacion-graficos/calificacion-graficos-ingles.messages';

@Component({
  selector: 'app-calificacion-graficos',
  standalone: true,
  imports: [],
  templateUrl: './calificacion-graficos.component.html',
  styleUrl: './calificacion-graficos.component.css'
})
export class CalificacionGraficosComponent {

  private readonly languageService = inject(LanguageService);

  get mensajes() {
    return this.languageService.getMessages(MESSAGES, MESSAGES_EN);
  }

  @Input({ required: true })
  promedios!: CalificacionMateriaPromedioResponse;

  @Input()
  @Input()
  contexto: string | null = null;

  get contextoVisible(): string {
    return this.contexto ??
      this.mensajes.CALIFICATION_SUMMARY_GENERAL_CONTEXT;
  }

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
