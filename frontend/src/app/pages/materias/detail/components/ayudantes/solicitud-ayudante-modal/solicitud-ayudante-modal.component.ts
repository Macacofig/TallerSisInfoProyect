import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../../../services/auth.service';
import { AyudantesService } from '../../../../../../services/ayudantes.service';
import { LanguageService } from '../../../../../../services/language.service';
import { MESSAGES } from '../../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../../strings/materias/materias-ingles.messages';

type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

@Component({
  selector: 'app-solicitud-ayudante-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './solicitud-ayudante-modal.component.html',
  styleUrl: './solicitud-ayudante-modal.component.css',
})
export class SolicitudAyudanteModalComponent {
  private readonly authService = inject(AuthService);
  private readonly ayudantesService = inject(AyudantesService);
  private readonly languageService = inject(LanguageService);

  @Input({ required: true }) idMateria!: number;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() solicitudEnviada = new EventEmitter<void>();

  calificacion = 0;
  motivo = '';
  enviando = false;
  envioIntentado = false;
  errorEnvio = '';
  diasDisponibles: {
    dia: DiaSemana;
    seleccionado: boolean;
    desde: string;
    hasta: string;
  }[] = [
    { dia: 'lunes', seleccionado: false, desde: '', hasta: '' },
    { dia: 'martes', seleccionado: false, desde: '', hasta: '' },
    { dia: 'miercoles', seleccionado: false, desde: '', hasta: '' },
    { dia: 'jueves', seleccionado: false, desde: '', hasta: '' },
    { dia: 'viernes', seleccionado: false, desde: '', hasta: '' },
    { dia: 'sabado', seleccionado: false, desde: '', hasta: '' },
    { dia: 'domingo', seleccionado: false, desde: '', hasta: '' }
  ];

  get mensajes() {
    return this.languageService.getMessages(MESSAGES, MESSAGES_EN);
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    this.cerrar();
  }

  solicitarCierre(): void {
    this.cerrar();
  }

  cerrarDesdeOverlay(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar();
    }
  }

  nombreDia(dia: DiaSemana): string {
    const nombres: Record<DiaSemana, string> = {
      lunes: this.mensajes.ASSISTANT_APPLICATION_MONDAY,
      martes: this.mensajes.ASSISTANT_APPLICATION_TUESDAY,
      miercoles: this.mensajes.ASSISTANT_APPLICATION_WEDNESDAY,
      jueves: this.mensajes.ASSISTANT_APPLICATION_THURSDAY,
      viernes: this.mensajes.ASSISTANT_APPLICATION_FRIDAY,
      sabado: this.mensajes.ASSISTANT_APPLICATION_SATURDAY,
      domingo: this.mensajes.ASSISTANT_APPLICATION_SUNDAY
    };
    return nombres[dia];
  }

  enviar(formulario: NgForm): void {
    this.envioIntentado = true;
    this.errorEnvio = '';

    if (
      this.enviando ||
      !formulario.valid ||
      !Number.isFinite(this.calificacion) ||
      this.calificacion <= 0 ||
      !this.horariosValidos()
    ) {
      return;
    }

    const idEstudiante = this.authService.obtenerUsuario()?.id;
    if (!idEstudiante) {
      this.errorEnvio = this.mensajes.ASSISTANT_LOGIN_REQUIRED;
      return;
    }

    this.enviando = true;
    this.ayudantesService
      .solicitarSerAyudante({
        idEstudiante,
        idMateria: this.idMateria,
        motivo: this.motivo.trim(),
        calificacion: this.calificacion,
        horarios: this.diasDisponibles
          .filter((dia) => dia.seleccionado)
          .map((dia) => `${this.nombreDia(dia.dia)} ${dia.desde}-${dia.hasta}`)
          .join(', ')
      })
      .pipe(finalize(() => {
        this.enviando = false;
      }))
      .subscribe({
        next: () => {
          this.solicitudEnviada.emit();
          this.cerrarModal.emit();
        },
        error: () => {
          this.errorEnvio = this.mensajes.ASSISTANT_APPLICATION_ERROR;
        }
      });
  }

  horariosValidos(): boolean {
    const seleccionados = this.diasDisponibles.filter((dia) => dia.seleccionado);
    return seleccionados.length > 0 && seleccionados.every(
      (dia) => Boolean(dia.desde && dia.hasta && dia.desde < dia.hasta)
    );
  }

  private cerrar(): void {
    if (!this.enviando) {
      this.cerrarModal.emit();
    }
  }
}
