import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';

import {
  MESSAGES
} from '../../../../../strings/materias/materias.messages';
import {
  MESSAGES_EN
} from '../../../../../strings/materias/materias-ingles.messages';
import {
  LanguageService
} from '../../../../../services/language.service';

export type SeccionDetalleMateria =
  | 'resumen'
  | 'docentes'
  | 'material'
  | 'evaluaciones'
  | 'ayudantes';

@Component({
  selector: 'app-materia-detalle-secciones',
  standalone: true,
  templateUrl: './secciones-detalle.component.html',
  styleUrl: './secciones-detalle.component.css'
})
export class SeccionesDetalleComponent {

  private readonly languageService = inject(LanguageService);

  @Input({ required: true })
  seccionActiva!: SeccionDetalleMateria;

  @Output()
  readonly seccionSeleccionada =
    new EventEmitter<SeccionDetalleMateria>();

  get mensajes() {
    return this.languageService.getMessages(MESSAGES, MESSAGES_EN);
  }

  get secciones() {
    return [
      {
        id: 'resumen',
        etiqueta: this.mensajes.MATERIA_DETAIL_SECTION_SUMMARY
      },
      {
        id: 'docentes',
        etiqueta: this.mensajes.MATERIA_DETAIL_SECTION_TEACHERS
      },
      {
        id: 'material',
        etiqueta: this.mensajes.MATERIA_DETAIL_SECTION_MATERIAL
      },
      {
        id: 'evaluaciones',
        etiqueta: this.mensajes.MATERIA_DETAIL_SECTION_EVALUATIONS
      },
      {
        id: 'ayudantes',
        etiqueta: this.mensajes.MATERIA_DETAIL_SECTION_ASSISTANTS
      }
    ] as const;
  }

  seleccionar(
    seccion: SeccionDetalleMateria
  ): void {

    if (seccion === this.seccionActiva) {
      return;
    }

    this.seccionSeleccionada.emit(seccion);
  }
}
