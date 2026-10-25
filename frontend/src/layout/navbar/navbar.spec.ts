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

  it('exposes the profile trigger as a named button and keeps menu state in sync', async () => {
    const trigger = fixture.nativeElement.querySelector('.navbar__user') as HTMLButtonElement;

    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.type).toBe('button');
    expect(trigger.getAttribute('aria-label')).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('.navbar__user-menu-item').length).toBe(2);

    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.navbar__user-menu')).toBeNull();
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
