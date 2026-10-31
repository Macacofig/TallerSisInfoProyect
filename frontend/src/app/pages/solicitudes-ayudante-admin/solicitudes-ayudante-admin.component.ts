import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { SolicitudAyudanteResponse } from '../../models/ayudante-materia.model';
import { AyudantesService } from '../../services/ayudantes.service';
import { LanguageService } from '../../services/language.service';
import { MESSAGES } from '../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../strings/materias/materias-ingles.messages';

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

  solicitudes: SolicitudAyudanteResponse[] = [];
  cargando = false;
  idEnProceso: number | null = null;
  errorCarga = '';
  mensajeAccion = '';

  get mensajes() {
    return this.languageService.getMessages(MESSAGES, MESSAGES_EN);
  }

  constructor() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    if (this.cargando || this.idEnProceso !== null) return;
    this.cargando = true;
    this.errorCarga = '';
    this.ayudantesService.obtenerSolicitudesAyudantePendientes()
      .pipe(finalize(() => this.cargando = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: solicitudes => this.solicitudes = solicitudes,
        error: error => this.errorCarga = this.mensajeError(error, true),
      });
  }

  decidir(solicitud: SolicitudAyudanteResponse, decision: 'aprobar' | 'rechazar'): void {
    if (this.idEnProceso !== null || this.cargando || solicitud.estado !== 'PENDIENTE') return;

    const confirmacion = decision === 'aprobar'
      ? this.mensajes.ASSISTANT_ADMIN_CONFIRM_APPROVE
      : this.mensajes.ASSISTANT_ADMIN_CONFIRM_REJECT;
    if (!window.confirm(confirmacion)) return;

    this.idEnProceso = solicitud.id;
    this.mensajeAccion = '';
    const accion$ = decision === 'aprobar'
      ? this.ayudantesService.aprobarSolicitudAyudante(solicitud.id)
      : this.ayudantesService.rechazarSolicitudAyudante(solicitud.id);

    accion$
      .pipe(finalize(() => this.idEnProceso = null), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.idEnProceso = null;
          this.mensajeAccion = decision === 'aprobar'
            ? this.mensajes.ASSISTANT_ADMIN_APPROVED
            : this.mensajes.ASSISTANT_ADMIN_REJECTED;
          this.cargarSolicitudes();
        },
        error: error => this.mensajeAccion = this.mensajeError(error, false),
      });
  }

  private mensajeError(error: unknown, esCarga: boolean): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) return this.mensajes.ASSISTANT_ADMIN_UNAUTHORIZED;
      if (error.status === 403) return this.mensajes.ASSISTANT_ADMIN_FORBIDDEN;
    }
    return esCarga
      ? this.mensajes.ASSISTANT_ADMIN_LOAD_ERROR
      : this.mensajes.ASSISTANT_ADMIN_ACTION_ERROR;
  }
}
