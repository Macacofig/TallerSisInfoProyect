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

  horarios = [
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ];

  paginaActual = 1;

  get totalHorarios(): number {
    return this.horarios.length;
  }

  get hayHorarios(): boolean {
    return this.totalHorarios > 0;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual === this.totalHorarios;
  }

  anterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  siguiente(): void {
    if (this.paginaActual < this.totalHorarios) {
      this.paginaActual++;
    }
  }

  render(): void {
    if (this.totalHorarios === 0) {
      this.paginaActual = 1;
      return;
    }

    if (this.paginaActual > this.totalHorarios) {
      this.paginaActual = this.totalHorarios;
    }
  }

}