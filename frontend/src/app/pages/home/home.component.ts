import { Component, inject } from '@angular/core';
import { MateriasTreeComponent } from './components/materias-tree/materias-tree.component';
import { LanguageService } from '../../services/language.service';
import { FeatureToggleService } from '../../services/feature-toggle.service';
import { HOME_MESSAGES } from '../../strings/home/home.messages';
import { HOME_MESSAGES as HOME_MESSAGES_EN } from '../../strings/home/home-ingles.messages';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MateriasTreeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly languageService = inject(LanguageService);
  readonly featureToggleService = inject(FeatureToggleService);

  get mensajes() {
    return this.languageService.getMessages(HOME_MESSAGES, HOME_MESSAGES_EN);
  }
}