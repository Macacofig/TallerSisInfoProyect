import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api';
import { Sidebar } from '../layouts/sidebar/sidebar';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  protected readonly title = signal('frontend');

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