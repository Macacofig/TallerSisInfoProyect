import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LanguageService } from '../../services/language.service';
import { SPLASH_MESSAGES } from '../../strings/splash/splash.messages';
import { SPLASH_MESSAGES_EN } from '../../strings/splash/splash-ingles.messages';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [],
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.css'
})
export class SplashComponent implements OnInit {

  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  get MESSAGES() {
    return this.languageService.getMessages(SPLASH_MESSAGES, SPLASH_MESSAGES_EN);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/registro'], { replaceUrl: true });
    }, 3000);
  }
}