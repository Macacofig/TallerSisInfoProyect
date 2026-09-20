import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { APP_CONFIG } from './config/app-config';
import { ApiService } from './services/api';
import { Sidebar } from '../layout/sidebar/sidebar';

import { Navbar } from '../layout/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  protected readonly title = signal('frontend');

  private readonly router = inject(Router);

  private readonly rutaActual = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects.split(/[?#]/)[0])
    ),
    { initialValue: this.router.url.split(/[?#]/)[0] }
  );

  /** false en splash y registro (pantalla completa, sin sidebar ni navbar). */
  protected readonly mostrarLayout = computed(
    () => !(APP_CONFIG.ROUTES.SIN_LAYOUT as readonly string[]).includes(this.rutaActual())
  );

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {

    console.log('App inició');

    this.apiService.test().subscribe({
      next: respuesta => {
        console.log('Respuesta del backend:', respuesta);
      },
      error: error => {
        console.error('Error conectando con el backend:', error);
      }
    });

  }
}