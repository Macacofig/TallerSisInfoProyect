import { Component, inject } from '@angular/core';

import { LanguageService } from '../../../services/language.service';
import { MATERIAL_PENDIENTE_MESSAGES } from '../../../strings/admin/material-pendiente/material-pendiente.messages';
import { MATERIAL_PENDIENTE_MESSAGES_EN } from '../../../strings/admin/material-pendiente/material-pendiente-ingles.messages';
import {
  MATERIAL_PENDIENTE_DOCUMENTOS_MOCK,
  MaterialPendienteDocumento
} from './material-pendiente.mock';

@Component({
  selector: 'app-material-pendiente',
  standalone: true,
  templateUrl: './material-pendiente.component.html',
  styleUrl: './material-pendiente.component.css',
})
export class MaterialPendienteComponent {
  private readonly languageService = inject(LanguageService);

  readonly documentos: MaterialPendienteDocumento[] = [...MATERIAL_PENDIENTE_DOCUMENTOS_MOCK];

  get mensajes() {
    return this.languageService.getMessages(
      MATERIAL_PENDIENTE_MESSAGES,
      MATERIAL_PENDIENTE_MESSAGES_EN
    );
  }

  get tituloConteo(): string {
    const plantilla = this.documentos.length === 1
      ? this.mensajes.COUNT_SINGULAR
      : this.mensajes.COUNT_PLURAL;
    return plantilla.replace('{count}', String(this.documentos.length));
  }
}
