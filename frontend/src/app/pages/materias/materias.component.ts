import { Component } from '@angular/core';
import { PAGES_STRINGS as PAGES_TEXTS } from '../../strings/pages.strings';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [],
  templateUrl: './materias.component.html',
  styleUrl: './materias.component.scss'
})
export class MateriasComponent {
  protected readonly MATERIAS_STRINGS = PAGES_TEXTS.materias;
}