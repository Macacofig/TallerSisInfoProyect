import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../../../services/auth.service';
import { AyudantesService } from '../../../../../../services/ayudantes.service';
import { LanguageService } from '../../../../../../services/language.service';
import { MESSAGES } from '../../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../../strings/materias/materias-ingles.messages';

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
  horarios = '';
  motivo = '';
  enviando = false;
  envioIntentado = false;
  errorEnvio = '';

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

  enviar(formulario: NgForm): void {
    this.envioIntentado = true;
    this.errorEnvio = '';

    if (
      this.enviando ||
      !formulario.valid ||
      !Number.isFinite(this.calificacion) ||
      this.calificacion <= 0
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
        horarios: this.horarios.trim()
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

  private cerrar(): void {
    if (!this.enviando) {
      this.cerrarModal.emit();
    }
  }
}
