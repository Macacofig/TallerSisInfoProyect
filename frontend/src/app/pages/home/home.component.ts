import { Component } from '@angular/core';
import { MateriasTreeComponent } from './components/materias-tree/materias-tree.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MateriasTreeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
