import { Component } from '@angular/core';
import {
  MATERIAS_HORARIOS,
  MateriaHorario
} from '../../data/horarios.data';
import { HORARIOS_MESSAGES } from '../../strings/horarios/horarios.messages';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.css',
})
export class HorariosComponent {
  readonly mensajes = HORARIOS_MESSAGES;

  readonly materias: MateriaHorario[] = MATERIAS_HORARIOS;
}