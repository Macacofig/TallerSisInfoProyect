import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  MESSAGES
} from '../../../../../../strings/materias/materias.messages';

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
  styleUrl: './secciones-detalle.component.scss'
})
export class SeccionesDetalleComponent {

  @Input({ required: true })
  seccionActiva!: SeccionDetalleMateria;

  @Output()
  readonly seccionSeleccionada =
    new EventEmitter<SeccionDetalleMateria>();

  readonly mensajes = MESSAGES;

  readonly secciones = [
    {
      id: 'resumen',
      etiqueta: MESSAGES.MATERIA_DETAIL_SECTION_SUMMARY
    },
    {
      id: 'docentes',
      etiqueta: MESSAGES.MATERIA_DETAIL_SECTION_TEACHERS
    },
    {
      id: 'material',
      etiqueta: MESSAGES.MATERIA_DETAIL_SECTION_MATERIAL
    },
    {
      id: 'evaluaciones',
      etiqueta: MESSAGES.MATERIA_DETAIL_SECTION_EVALUATIONS
    },
    {
      id: 'ayudantes',
      etiqueta: MESSAGES.MATERIA_DETAIL_SECTION_ASSISTANTS
    }
  ] as const;

  seleccionar(
    seccion: SeccionDetalleMateria
  ): void {

    if (seccion === this.seccionActiva) {
      return;
    }

    this.seccionSeleccionada.emit(seccion);
  }
}