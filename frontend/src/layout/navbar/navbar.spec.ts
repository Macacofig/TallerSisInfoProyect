import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageService } from '../../app/services/language.service';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let languageService: LanguageService;

  beforeEach(async () => {
    localStorage.removeItem('unihub-language');

    await TestBed.configureTestingModule({
      imports: [Navbar],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    languageService = TestBed.inject(LanguageService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('switches visible labels from Spanish to English and back', async () => {
    const toggle = fixture.nativeElement.querySelector(
      '.navbar__language-toggle'
    ) as HTMLButtonElement;

    expect(toggle.textContent?.trim()).toBe('EN');
    expect(toggle.getAttribute('aria-label')).toBe('Cambiar idioma');

    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(languageService.currentLanguage()).toBe('en');
    expect(toggle.textContent?.trim()).toBe('ES');
    expect(toggle.getAttribute('aria-label')).toBe('Change language');
    expect(document.documentElement.lang).toBe('en');

    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(languageService.currentLanguage()).toBe('es');
    expect(toggle.textContent?.trim()).toBe('EN');
    expect(toggle.getAttribute('aria-label')).toBe('Cambiar idioma');
    expect(document.documentElement.lang).toBe('es');
  });
});
