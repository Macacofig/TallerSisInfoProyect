import { Component } from '@angular/core';
import { MateriasTreeComponent } from './components/materias-tree/materias-tree.component';
import { HOME_MESSAGES } from '../../strings/home/home.messages';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MateriasTreeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly mensajes = HOME_MESSAGES;
}