import { ChangeDetectorRef, Component, DestroyRef, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subscription, finalize, timeout } from 'rxjs';

import { APP_CONFIG } from '../../../../../config/app-config';
import { AuthService } from '../../../../../services/auth.service';
import { AyudantesService } from '../../../../../services/ayudantes.service';
import { LanguageService } from '../../../../../services/language.service';
import { MESSAGES } from '../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../strings/materias/materias-ingles.messages';
import { SolicitudAyudanteModalComponent } from './solicitud-ayudante-modal/solicitud-ayudante-modal.component';
import { construirEnlaceWhatsApp, construirMensajeSolicitudAyuda } from '../../../../../utils/whatsapp.utils';

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
  imports: [FormsModule, SolicitudAyudanteModalComponent],
})

export class AyudantesComponent implements OnChanges {
  private readonly languageService = inject(LanguageService);
  private readonly authService = inject(AuthService);
  private readonly ayudantesService = inject(AyudantesService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private cargaAyudantes?: Subscription;
  private consultaContacto?: Subscription;
  private botonContacto?: HTMLButtonElement;
  @ViewChild('dialogoContacto') private dialogoContacto!: ElementRef<HTMLDialogElement>;
  @ViewChild('mensajeContacto') private mensajeContacto?: ElementRef<HTMLTextAreaElement>;

  contactoSeleccionado: { ayudante: AyudanteVista; idMateria: number; nombreMateria: string } | null = null;
  mensajePersonalizado = '';
  contactoIntentado = false;

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
      this.consultaContacto?.unsubscribe();
      this.cerrarContacto();
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

  solicitarContacto(ayudante: AyudanteVista, origen: HTMLButtonElement): void {
    if (this.solicitudEnviando || this.contactoSeleccionado) {
      return;
    }

    const usuario = this.authService.obtenerUsuario();
    if (!usuario) {
      this.mensajeSolicitud = this.mensajes.ASSISTANT_LOGIN_REQUIRED;
      return;
    }

    if (this.idMateria === null) {
      return;
    }

    this.contactoSeleccionado = { ayudante, idMateria: this.idMateria, nombreMateria: this.nombreMateria };
    this.botonContacto = origen;
    this.mensajePersonalizado = '';
    this.contactoIntentado = false;
    this.mensajeSolicitud = '';
    this.changeDetectorRef.detectChanges();
    this.dialogoContacto.nativeElement.showModal();
    this.mensajeContacto?.nativeElement.focus();
  }

  cancelarContacto(event: Event): void {
    event.preventDefault();
    this.cerrarContacto();
  }

  cerrarContacto(): void {
    if (!this.solicitudEnviando && this.contactoSeleccionado) {
      this.dialogoContacto.nativeElement.close();
    }
  }

  limpiarContacto(): void {
    this.contactoSeleccionado = null;
    this.mensajePersonalizado = '';
    this.contactoIntentado = false;
    this.mensajeSolicitud = '';
    this.changeDetectorRef.detectChanges();
    this.botonContacto?.focus({ preventScroll: true });
    this.botonContacto = undefined;
  }

  continuarContacto(): void {
    if (this.solicitudEnviando || !this.contactoSeleccionado) {
      return;
    }
    this.contactoIntentado = true;
    if (!this.mensajePersonalizado.trim()) {
      this.mensajeContacto?.nativeElement.focus();
      return;
    }
    const usuario = this.authService.obtenerUsuario();
    if (!usuario) {
      this.mensajeSolicitud = this.mensajes.ASSISTANT_LOGIN_REQUIRED;
      return;
    }
    const { ayudante, nombreMateria } = this.contactoSeleccionado;
    const mensajeCompleto = construirMensajeSolicitudAyuda(
      ayudante.nombre, usuario.nombre, nombreMateria, this.mensajePersonalizado
    );
    let aperturaSolicitada = false;
    this.solicitudEnviando = true;
    this.mensajeSolicitud = '';
    this.consultaContacto = this.ayudantesService.obtenerTelefonoEstudiante(ayudante.idEstudiante).pipe(
      timeout(APP_CONFIG.TIMEOUTS.API_REQUEST),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.solicitudEnviando = false;
        if (!this.destroyRef.destroyed) {
          this.changeDetectorRef.markForCheck();
          if (aperturaSolicitada) {
            this.cerrarContacto();
          }
        }
      })
    ).subscribe({
      next: (respuesta) => {
        const enlace = construirEnlaceWhatsApp(respuesta.telefono, mensajeCompleto);
        if (!enlace) {
          this.mensajeSolicitud = this.mensajes.ASSISTANT_CONTACT_PHONE_ERROR;
          return;
        }
        window.open(enlace, '_blank', 'noopener');
        aperturaSolicitada = true;
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
