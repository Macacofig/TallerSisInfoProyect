import { Injectable, computed, effect, signal } from '@angular/core';

export type AppLanguage = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'unihub-language';

  readonly currentLanguage = signal<AppLanguage>(this.getInitialLanguage());
  readonly isEnglish = computed(() => this.currentLanguage() === 'en');

  constructor() {
    effect(() => {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = this.currentLanguage();
      }
    });
  }

  toggleLanguage(): void {
    this.setLanguage(this.currentLanguage() === 'es' ? 'en' : 'es');
  }

  setLanguage(language: AppLanguage): void {
    this.currentLanguage.set(language);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, language);
    }
  }

  getMessages<
    T extends Record<string, unknown>,
    U extends { [Key in keyof T]: unknown }
  >(
    spanish: T,
    ingles: U
  ): T | U {
    return this.currentLanguage() === 'en' ? ingles : spanish;
  }

  private getInitialLanguage(): AppLanguage {
    if (typeof localStorage === 'undefined') {
      return 'es';
    }

    const idiomaGuardado = localStorage.getItem(this.STORAGE_KEY);
    return idiomaGuardado === 'en' ? 'en' : 'es';
  }
}
