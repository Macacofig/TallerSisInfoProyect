import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PAGES_STRINGS as PAGES_TEXTS } from '../../strings/pages.strings';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [],
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.scss'
})
export class SplashComponent implements OnInit {
  protected readonly SPLASH_STRINGS = PAGES_TEXTS.splash;

  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/materias']);
    }, 3000);
  }
}