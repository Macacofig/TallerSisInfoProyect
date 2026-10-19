import { Component, inject } from '@angular/core';

import { LanguageService } from '../../../../../services/language.service';
import { MESSAGES } from '../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../strings/materias/materias-ingles.messages';
import { AYUDANTES } from '../../../../../data/ayudantes.data';

@Component({
  selector: 'app-ayudantes.component',
  standalone: true,
  templateUrl: './ayudantes.component.html',
  styleUrl: './ayudantes.component.css',
})

export class AyudantesComponent {
  private readonly languageService = inject(LanguageService);

  readonly ayudantes = AYUDANTES;

  get mensajes() {
    return this.languageService.getMessages(MESSAGES, MESSAGES_EN);
  }
}