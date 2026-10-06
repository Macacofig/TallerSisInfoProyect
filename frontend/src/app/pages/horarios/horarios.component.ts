import { Component } from '@angular/core';
import {
  MATERIAS_HORARIOS,
  MateriaHorario
} from '../../data/horarios.data';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.css',
})
export class HorariosComponent {

  readonly materias: MateriaHorario[] = MATERIAS_HORARIOS;

}