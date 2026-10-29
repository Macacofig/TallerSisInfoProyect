import { ChangeDetectorRef, Component, DestroyRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, finalize, timeout } from 'rxjs';

import { APP_CONFIG } from '../../../../../config/app-config';
import { AyudanteMateriaResponse } from '../../../../../models/ayudante-materia.model';
import { AuthService } from '../../../../../services/auth.service';
import { AyudantesService } from '../../../../../services/ayudantes.service';
import { LanguageService } from '../../../../../services/language.service';
import { MESSAGES } from '../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../strings/materias/materias-ingles.messages';
import { SolicitudAyudanteModalComponent } from './solicitud-ayudante-modal/solicitud-ayudante-modal.component';
import { construirEnlaceWhatsApp } from '../../../../../utils/whatsapp.utils';

interface AyudanteVista {
  id: number;
  idEstudiante: number;
  nombre: string;
  iniciales: string;
  verificado: boolean;
  horario: string;
}

@Component({
  selector: 'app-ayudantes',
  standalone: true,
  templateUrl: './ayudantes.component.html',
  styleUrl: './ayudantes.component.css',
  imports: [SolicitudAyudanteModalComponent],
})

export class AyudantesComponent implements OnChanges {
  private readonly languageService = inject(LanguageService);
  private readonly authService = inject(AuthService);
  private readonly ayudantesService = inject(AyudantesService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private cargaAyudantes?: Subscription;

  @Input() idMateria: number | null = null;
  @Input() nombreMateria = '';

  ayudantes: AyudanteVista[] = [];
  cargando = false;
  errorCarga = false;
  solicitudEnviando = false;
  mensajeSolicitud = '';
  solicitudModalAbierta = false;

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

  abrirSolicitud(): void {
    if (this.idMateria !== null) {
      this.solicitudModalAbierta = true;
    }
  }

  esAyudantePropio(ayudante: AyudanteVista): boolean {
    return ayudante.idEstudiante === this.authService.obtenerUsuario()?.id;
  }

  cerrarSolicitud(): void {
    this.solicitudModalAbierta = false;
  }

  refrescarAyudantes(): void {
    if (this.idMateria !== null) {
      this.cargarAyudantes(this.idMateria);
    }
  }

  solicitarContacto(ayudante: AyudanteVista): void {
    if (this.solicitudEnviando) {
      return;
    }

    const usuario = this.authService.obtenerUsuario();
    if (!usuario) {
      this.mensajeSolicitud = this.mensajes.ASSISTANT_LOGIN_REQUIRED;
      return;
    }

    this.solicitudEnviando = true;
    this.mensajeSolicitud = '';
    this.ayudantesService.obtenerTelefonoEstudiante(ayudante.idEstudiante).pipe(
      timeout(APP_CONFIG.TIMEOUTS.API_REQUEST),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.solicitudEnviando = false;
        if (!this.destroyRef.destroyed) {
          this.changeDetectorRef.markForCheck();
        }
      })
    ).subscribe({
      next: (respuesta) => {
        const mensaje = `Hola ${ayudante.nombre}, soy ${usuario.nombre}. Quisiera que me des ayudantía en la materia ${this.nombreMateria}.`;
        const enlace = construirEnlaceWhatsApp(respuesta.telefono, mensaje);
        if (!enlace) {
          this.mensajeSolicitud = this.mensajes.ASSISTANT_CONTACT_PHONE_ERROR;
          return;
        }
        window.open(enlace, '_blank', 'noopener');
      },
      error: () => {
        this.mensajeSolicitud = this.mensajes.ASSISTANT_CONTACT_PHONE_ERROR;
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
        this.changeDetectorRef.markForCheck();
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
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.errorCarga = true;
          this.changeDetectorRef.markForCheck();
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
