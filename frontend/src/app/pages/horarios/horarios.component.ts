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

  readonly textos = HORARIOS_MESSAGES;

  readonly materias: MateriaHorario[] = MATERIAS_HORARIOS;

  materiasSeleccionadas: MateriaHorario[] = [];

  readonly dias = HORARIOS_MESSAGES.DAYS;

  horas = [
    '07:15',
    '08:00',
    '08:45',
    '09:30',
    '10:15',
    '11:00',
    '11:45',
    '12:30',
    '13:15',
    '14:00',
    '14:45',
    '15:30',
    '16:15',
    '17:00',
    '17:45',
    '18:30',
    '19:15',
    '20:00',
    '20:45'
  ];

  paginaActual = 1;

  readonly alturaFila = 72;

  constructor() {
    this.materiasSeleccionadas = this.materias.filter(
      materia => materia.seleccionada
    );

    this.render();
  }

  /* =========================
     PAGINACIÓN DINÁMICA
     ========================= */

  get totalHorarios(): number {
    if (this.materiasSeleccionadas.length === 0) {
      return 0;
    }

    return Math.max(
      0,
      ...this.materiasSeleccionadas.map(
        materia => materia.opciones?.length ?? 0
      )
    );
  }

  get hayHorarios(): boolean {
    return this.totalHorarios > 0;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual >= this.totalHorarios;
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

    if (this.paginaActual < 1) {
      this.paginaActual = 1;
    }
  }

  /* =========================
     SELECCIÓN DE MATERIAS
     ========================= */

  seleccionarMateria(materia: MateriaHorario): void {
    materia.seleccionada = !materia.seleccionada;

    if (materia.seleccionada) {
      const yaExiste = this.materiasSeleccionadas.some(
        m => m.codigo === materia.codigo
      );

      if (!yaExiste) {
        this.materiasSeleccionadas.push(materia);
      }
    } else {
      this.materiasSeleccionadas =
        this.materiasSeleccionadas.filter(
          m => m.codigo !== materia.codigo
        );
    }

    this.render();
  }

  /* =========================
     OPCIÓN SEGÚN LA PÁGINA
     ========================= */

  private obtenerHorarioPrincipal(
    materia: MateriaHorario
  ): string {
    const indiceOpcion = this.paginaActual - 1;

    if (
      !materia.opciones ||
      indiceOpcion < 0 ||
      indiceOpcion >= materia.opciones.length
    ) {
      return '';
    }

    return materia.opciones[indiceOpcion].horario;
  }

  /* =========================
     BLOQUES DE MATERIA
     ========================= */

  obtenerBloquesMateria(
    materia: MateriaHorario,
    dia: string
  ): {
    inicio: string;
    fin: string;
  }[] {
    const horario = this.obtenerHorarioPrincipal(materia);

    if (!horario) {
      return [];
    }

    const bloques = horario.split('·');

    const resultado: {
      inicio: string;
      fin: string;
    }[] = [];

    for (const bloque of bloques) {
      const bloqueNormalizado = bloque.trim();

      const regex =
        /^(.+?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/;

      const coincidencia = bloqueNormalizado.match(regex);

      if (!coincidencia) {
        continue;
      }

      const diaBloque = coincidencia[1].trim().toLowerCase();

      if (diaBloque !== dia.toLowerCase()) {
        continue;
      }

      resultado.push({
        inicio: coincidencia[2],
        fin: coincidencia[3]
      });
    }

    return resultado;
  }

  /* =========================
     POSICIÓN DE LA TARJETA
     ========================= */

  obtenerPosicionMateria(horaInicio: string): number {
    const minutosInicio = this.convertirMinutos(horaInicio);

    const minutosPrimeraHora = this.convertirMinutos(
      this.horas[0]
    );

    const diferencia = minutosInicio - minutosPrimeraHora;

    return (diferencia / 45) * this.alturaFila;
  }

  /* =========================
     ALTURA DE LA TARJETA
     ========================= */

  obtenerAlturaMateria(
    horaInicio: string,
    horaFin: string
  ): number {
    const inicio = this.convertirMinutos(horaInicio);
    const fin = this.convertirMinutos(horaFin);

    const duracion = fin - inicio;
    const cantidadFilas = duracion / 45;
    const espacioVertical = 8;

    return Math.max(
      this.alturaFila * cantidadFilas - espacioVertical,
      30
    );
  }

  /* =========================
     COMPROBAR HORARIO
     ========================= */

  estaMateriaEnHorario(
    materia: MateriaHorario,
    dia: string,
    hora: string
  ): boolean {
    const bloques = this.obtenerBloquesMateria(materia, dia);
    const horaActual = this.convertirMinutos(hora);

    return bloques.some(bloque => {
      const inicio = this.convertirMinutos(bloque.inicio);
      const fin = this.convertirMinutos(bloque.fin);

      return horaActual >= inicio && horaActual < fin;
    });
  }

  /* =========================
     MOSTRAR TARJETA
     ========================= */

  mostrarMateriaEnCelda(
    materia: MateriaHorario,
    dia: string,
    hora: string
  ): boolean {
    const bloques = this.obtenerBloquesMateria(materia, dia);
    const horaActual = this.convertirMinutos(hora);

    return bloques.some(bloque => {
      const inicio = this.convertirMinutos(bloque.inicio);

      return horaActual === inicio;
    });
  }

  /* =========================
     CONVERSIÓN DE HORAS
     ========================= */

  private convertirMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);

    return horas * 60 + minutos;
  }

  /* =========================
     COLORES
     ========================= */

  obtenerColorMateria(codigo: string): string {
    const colores: Record<string, string> = {
      'INF-101': '#0b3c8c',
      'INF-202': '#2e7d5b',
      'INF-305': '#e3a82b',
      'INF-410': '#7957a8'
    };

    return colores[codigo] ?? '#4f5d73';
  }
}