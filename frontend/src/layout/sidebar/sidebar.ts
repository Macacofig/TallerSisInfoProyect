import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../app/services/language.service';
import { SIDEBAR_MESSAGES } from '../../app/strings/layout/sidebar.messages';
import { SIDEBAR_MESSAGES_EN } from '../../app/strings/layout/sidebar-ingles.messages';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly languageService = inject(LanguageService);

  get SIDEBAR_MESSAGES() {
    return this.languageService.getMessages(SIDEBAR_MESSAGES, SIDEBAR_MESSAGES_EN);
  }
}
