import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { first, timeout } from 'rxjs';

import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { SPLASH_MESSAGES } from '../../strings/splash/splash.messages';
import { SPLASH_MESSAGES_EN } from '../../strings/splash/splash-ingles.messages';

type SplashStage = 'INITIALIZATION' | 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'COMPLETE';
type FailedService = 'backend' | 'database';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [],
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.css'
})
export class SplashComponent {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  readonly stage = signal<SplashStage>('INITIALIZATION');
  readonly progress = signal(0);
  readonly failedService = signal<FailedService | null>(null);

  get MESSAGES() {
    return this.languageService.getMessages(SPLASH_MESSAGES, SPLASH_MESSAGES_EN);
  }

  constructor() {
    this.scheduleFrame(() => {
      this.stage.set('FRONTEND');
      this.progress.set(20);
      this.scheduleFrame(() => this.checkBackend());
    });
  }

  retryConnection(): void {
    const failedService = this.failedService();
    if (!failedService) return;

    this.failedService.set(null);
    if (failedService === 'backend') {
      this.checkBackend();
    } else {
      this.checkDatabase();
    }
  }

  private checkBackend(): void {
    this.stage.set('BACKEND');
    this.apiService.test().pipe(
      timeout(8000),
      first()
    ).subscribe({
      next: () => {
        this.progress.set(55);
        this.checkDatabase();
      },
      error: () => this.failedService.set('backend')
    });
  }

  private checkDatabase(): void {
    this.stage.set('DATABASE');
    this.apiService.checkDatabase().pipe(
      timeout(8000),
      first()
    ).subscribe({
      next: () => {
        this.stage.set('COMPLETE');
        this.progress.set(100);
        this.scheduleFrame(() => {
          const route = this.authService.tieneSesionValida() ? '/home' : '/registro';
          void this.router.navigate([route], { replaceUrl: true });
        });
      },
      error: () => this.failedService.set('database')
    });
  }

  private scheduleFrame(callback: FrameRequestCallback): void {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(callback);
    } else {
      callback(0);
    }
  }
}
