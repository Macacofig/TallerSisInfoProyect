import { Component, inject } from '@angular/core';

import { LanguageService } from '../../services/language.service';
import { ADMIN_MESSAGES } from '../../strings/admin/admin/admin.messages';
import { ADMIN_MESSAGES_EN } from '../../strings/admin/admin/admin-ingles.messages';
import { SolicitudesAyudanteAdminComponent } from './solicitudes-ayudante/solicitudes-ayudante-admin.component';

type PestanaAdmin = 'material-pendiente' | 'solicitudes-ayudantes' | 'reportes';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [SolicitudesAyudanteAdminComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  private readonly languageService = inject(LanguageService);

  pestanaActiva: PestanaAdmin = 'solicitudes-ayudantes';

  get mensajes() {
    return this.languageService.getMessages(ADMIN_MESSAGES, ADMIN_MESSAGES_EN);
  }

  seleccionarPestana(pestana: PestanaAdmin): void {
    this.pestanaActiva = pestana;
  }
}
