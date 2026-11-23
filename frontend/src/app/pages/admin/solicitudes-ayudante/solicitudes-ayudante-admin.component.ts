import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { SolicitudAyudanteResponse } from '../../../models/ayudante-materia.model';
import { AyudantesService } from '../../../services/ayudantes.service';
import { LanguageService } from '../../../services/language.service';
import { SOLICITUDES_AYUDANTE_MESSAGES } from '../../../strings/admin/solicitudes-ayudante/solicitudes-ayudante.messages';
import { SOLICITUDES_AYUDANTE_MESSAGES_EN } from '../../../strings/admin/solicitudes-ayudante/solicitudes-ayudante-ingles.messages';

@Component({
  selector: 'app-solicitudes-ayudante-admin',
  standalone: true,
  templateUrl: './solicitudes-ayudante-admin.component.html',
  styleUrl: './solicitudes-ayudante-admin.component.css',
})
export class SolicitudesAyudanteAdminComponent {
  private readonly ayudantesService = inject(AyudantesService);
  private readonly languageService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  solicitudes: SolicitudAyudanteResponse[] = [];
  cargando = false;
  idEnProceso: number | null = null;
  errorCarga = '';
  mensajeAccion = '';

  get mensajes() {
    return this.languageService.getMessages(
      SOLICITUDES_AYUDANTE_MESSAGES,
      SOLICITUDES_AYUDANTE_MESSAGES_EN
    );
  }

  constructor() {
    this.cargarSolicitudes();
  }

  private cargarSolicitudes(): void {
    if (this.cargando || this.idEnProceso !== null) return;
    this.cargando = true;
    this.errorCarga = '';
    this.ayudantesService.obtenerSolicitudesAyudantePendientes()
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: solicitudes => this.solicitudes = solicitudes,
        error: error => this.errorCarga = this.mensajeError(error, true),
      });
  }

  decidir(solicitud: SolicitudAyudanteResponse, decision: 'aprobar' | 'rechazar'): void {
    if (this.idEnProceso !== null || this.cargando || solicitud.estado !== 'PENDIENTE') return;

    const confirmacion = decision === 'aprobar'
      ? this.mensajes.CONFIRM_APPROVE
      : this.mensajes.CONFIRM_REJECT;
    if (!window.confirm(confirmacion)) return;

    this.idEnProceso = solicitud.id;
    this.mensajeAccion = '';
    const accion$ = decision === 'aprobar'
      ? this.ayudantesService.aprobarSolicitudAyudante(solicitud.id)
      : this.ayudantesService.rechazarSolicitudAyudante(solicitud.id);

    accion$
      .pipe(
        finalize(() => {
          this.idEnProceso = null;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.idEnProceso = null;
          this.mensajeAccion = decision === 'aprobar'
            ? this.mensajes.APPROVED
            : this.mensajes.REJECTED;
          this.cargarSolicitudes();
        },
        error: error => this.mensajeAccion = this.mensajeError(error, false),
      });
  }

  estadoTexto(estado: string): string {
    if (estado === 'PENDIENTE') return this.mensajes.ESTADOS.PENDIENTE;
    if (estado === 'APROBADA') return this.mensajes.ESTADOS.APROBADA;
    if (estado === 'RECHAZADA') return this.mensajes.ESTADOS.RECHAZADA;
    return estado;
  }

  private mensajeError(error: unknown, esCarga: boolean): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) return this.mensajes.UNAUTHORIZED;
      if (error.status === 403) return this.mensajes.FORBIDDEN;
    }
    return esCarga
      ? this.mensajes.LOAD_ERROR
      : this.mensajes.ACTION_ERROR;
  }
}
