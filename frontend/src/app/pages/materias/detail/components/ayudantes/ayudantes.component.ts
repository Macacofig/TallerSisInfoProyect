import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Subscription, finalize } from 'rxjs';

import { AyudanteMateriaResponse } from '../../../../../models/ayudante-materia.model';
import { AuthService } from '../../../../../services/auth.service';
import { AyudantesService } from '../../../../../services/ayudantes.service';
import { LanguageService } from '../../../../../services/language.service';
import { MESSAGES } from '../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../strings/materias/materias-ingles.messages';

interface AyudanteVista {
  id: number;
  idEstudiante: number;
  nombre: string;
  iniciales: string;
  verificado: boolean;
  horario: string;
}

@Component({
  selector: 'app-ayudantes.component',
  standalone: true,
  templateUrl: './ayudantes.component.html',
  styleUrl: './ayudantes.component.css',
})

export class AyudantesComponent implements OnChanges {
  private readonly languageService = inject(LanguageService);
  private readonly authService = inject(AuthService);
  private readonly ayudantesService = inject(AyudantesService);
  private cargaAyudantes?: Subscription;

  @Input() idMateria: number | null = null;

  ayudantes: AyudanteVista[] = [];
  cargando = false;
  errorCarga = false;
  solicitudEnviando = false;
  mensajeSolicitud = '';

  get mensajes() {
    return this.languageService.getMessages(MESSAGES, MESSAGES_EN);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idMateria']) {
      this.cargaAyudantes?.unsubscribe();
      this.ayudantes = [];
      this.cargando = false;
      this.errorCarga = false;

      if (this.idMateria !== null) {
        this.cargarAyudantes(this.idMateria);
      }
    }
  }

  solicitarContacto(ayudante: AyudanteVista): void {
    const idEstudiante = this.authService.obtenerUsuario()?.id;
    if (!idEstudiante) {
      this.mensajeSolicitud = this.mensajes.ASSISTANT_LOGIN_REQUIRED;
      return;
    }

    const peticion = window.prompt(this.mensajes.ASSISTANT_REQUEST_PROMPT)?.trim();
    if (!peticion || this.idMateria === null) {
      return;
    }

    this.solicitudEnviando = true;
    this.mensajeSolicitud = '';
    this.ayudantesService.solicitarAyuda({
      idEstudiante,
      idAyudante: ayudante.idEstudiante,
      idMateria: this.idMateria,
      peticion
    }).subscribe({
      next: () => {
        this.solicitudEnviando = false;
        this.mensajeSolicitud = this.mensajes.ASSISTANT_REQUEST_SUCCESS;
      },
      error: () => {
        this.solicitudEnviando = false;
        this.mensajeSolicitud = this.mensajes.ASSISTANT_REQUEST_ERROR;
      }
    });
  }

  private cargarAyudantes(idMateria: number): void {
    this.cargando = true;
    this.errorCarga = false;
    this.cargaAyudantes = this.ayudantesService
      .obtenerAprobadosPorMateria(idMateria)
      .pipe(finalize(() => {
        this.cargando = false;
      }))
      .subscribe({
        next: (respuesta) => {
          this.ayudantes = respuesta.map((ayudante) => ({
            id: ayudante.id,
            idEstudiante: ayudante.idEstudiante,
            nombre: ayudante.nombreEstudiante,
            iniciales: this.obtenerIniciales(ayudante.nombreEstudiante),
            verificado: ayudante.estado === 'APROBADO',
            horario: ayudante.horario
          }));
        },
        error: () => {
          this.errorCarga = true;
        }
      });
  }

  private obtenerIniciales(nombre: string): string {
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join('')
      .toUpperCase();
  }
}