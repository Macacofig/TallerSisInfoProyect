import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SPLASH_MESSAGES } from '../../strings/splash/splash.messages';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [],
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.css'
})
export class SplashComponent implements OnInit {

  readonly MESSAGES = SPLASH_MESSAGES;

  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/registro'], { replaceUrl: true });
    }, 3000);
  }
}