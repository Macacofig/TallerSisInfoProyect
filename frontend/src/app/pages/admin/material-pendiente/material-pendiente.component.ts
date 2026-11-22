import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';

import { SolicitudMaterialResponse } from '../../../models/solicitud-material.model';
import { ApiService } from '../../../services/api';
import { LanguageService } from '../../../services/language.service';
import { SolicitudMaterialAdminService } from '../../../services/solicitud-material-admin.service';
import { MATERIAL_PENDIENTE_MESSAGES } from '../../../strings/admin/material-pendiente/material-pendiente.messages';
import { MATERIAL_PENDIENTE_MESSAGES_EN } from '../../../strings/admin/material-pendiente/material-pendiente-ingles.messages';

@Component({
  selector: 'app-material-pendiente',
  standalone: true,
  templateUrl: './material-pendiente.component.html',
  styleUrl: './material-pendiente.component.css',
})
export class MaterialPendienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly service = inject(SolicitudMaterialAdminService);

  readonly documentos = signal<SolicitudMaterialResponse[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly mensajeAccion = signal('');
  readonly errorAccion = signal(false);
  readonly idSolicitudEnCurso = signal<number | null>(null);
  readonly vistaPreviaUrl = signal<string | null>(null);
  readonly vistaPreviaUrlSegura = computed(() => {
    const url = this.vistaPreviaUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  readonly vistaPreviaEsPdf = signal(false);
  readonly vistaPreviaTitulo = signal('');
  readonly dialogoVistaPrevia = viewChild<ElementRef<HTMLDialogElement>>('dialogoVistaPrevia');

  private readonly sincronizarDialogo = effect(() => {
    const dialogo = this.dialogoVistaPrevia()?.nativeElement;
    if (!dialogo) return;

    if (this.vistaPreviaUrl() && !dialogo.open) dialogo.showModal();
    if (!this.vistaPreviaUrl() && dialogo.open) dialogo.close();
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.liberarVistaPrevia());
  }

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  get mensajes() {
    return this.languageService.getMessages(
      MATERIAL_PENDIENTE_MESSAGES,
      MATERIAL_PENDIENTE_MESSAGES_EN
    );
  }

  get tituloConteo(): string {
    const plantilla = this.documentos().length === 1
      ? this.mensajes.COUNT_SINGULAR
      : this.mensajes.COUNT_PLURAL;
    return plantilla.replace('{count}', String(this.documentos().length));
  }

  cargarDocumentos(): void {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.service.obtenerPendientes().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargando.set(false))
    ).subscribe({
      next: documentos => this.documentos.set(documentos),
      error: error => {
        const noAutorizado = error instanceof HttpErrorResponse
          && (error.status === 401 || error.status === 403);
        this.errorCarga.set(noAutorizado ? this.mensajes.LOAD_ACCESS_ERROR : this.mensajes.LOAD_ERROR);
      }
    });
  }

  aprobar(documento: SolicitudMaterialResponse): void {
    this.ejecutarAccion(documento, 'aprobar');
  }

  rechazar(documento: SolicitudMaterialResponse): void {
    this.ejecutarAccion(documento, 'rechazar');
  }

  eliminar(documento: SolicitudMaterialResponse): void {
    this.ejecutarAccion(documento, 'eliminar');
  }

  ver(documento: SolicitudMaterialResponse): void {
    if (this.idSolicitudEnCurso() !== null || documento.idMaterial === null) return;

    this.limpiarMensajeAccion();
    this.idSolicitudEnCurso.set(documento.id);
    this.api.descargarMaterial(documento.idMaterial).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.idSolicitudEnCurso.set(null))
    ).subscribe({
      next: respuesta => {
        const archivo = respuesta.body;
        const tipoContenido = (respuesta.headers.get('Content-Type') ?? archivo?.type ?? '')
          .split(';')[0].trim().toLowerCase();
        const esPdf = tipoContenido === 'application/pdf';
        const esImagen = tipoContenido.startsWith('image/');
        if (!archivo || tipoContenido === 'application/json' || tipoContenido.startsWith('text/')) {
          this.mostrarMensaje(this.mensajes.FEEDBACK.VIEW_ERROR, true);
          return;
        }
        if (!esPdf && !esImagen) {
          this.mostrarMensaje(this.mensajes.FEEDBACK.VIEW_UNAVAILABLE, false);
          return;
        }

        this.liberarVistaPrevia();
        this.vistaPreviaEsPdf.set(esPdf);
        this.vistaPreviaTitulo.set(documento.titulo);
        this.vistaPreviaUrl.set(URL.createObjectURL(archivo));
      },
      error: () => this.mostrarMensaje(this.mensajes.FEEDBACK.VIEW_ERROR, true)
    });
  }

  cerrarVistaPrevia(): void {
    this.liberarVistaPrevia();
  }

  private ejecutarAccion(
    documento: SolicitudMaterialResponse,
    accion: 'aprobar' | 'rechazar' | 'eliminar'
  ): void {
    if (this.idSolicitudEnCurso() !== null) return;

    const textoConfirmacion = accion === 'aprobar'
      ? this.mensajes.CONFIRMATIONS.APPROVE
      : accion === 'rechazar'
        ? this.mensajes.CONFIRMATIONS.REJECT
        : this.mensajes.CONFIRMATIONS.DELETE;
    if (!window.confirm(textoConfirmacion.replace('{name}', documento.titulo))) return;

    const operacion: Observable<unknown> = accion === 'aprobar'
      ? this.service.aprobar(documento.id)
      : accion === 'rechazar'
        ? this.service.rechazar(documento.id)
        : this.service.eliminar(documento.id);
    const claveResultado = accion === 'aprobar'
      ? 'APPROVE'
      : accion === 'rechazar'
        ? 'REJECT'
        : 'DELETE';

    this.limpiarMensajeAccion();
    this.idSolicitudEnCurso.set(documento.id);
    operacion.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.idSolicitudEnCurso.set(null))
    ).subscribe({
      next: () => {
        const mensaje = claveResultado === 'APPROVE'
          ? this.mensajes.FEEDBACK.APPROVE_SUCCESS
          : claveResultado === 'REJECT'
            ? this.mensajes.FEEDBACK.REJECT_SUCCESS
            : this.mensajes.FEEDBACK.DELETE_SUCCESS;
        this.mostrarMensaje(mensaje, false);
        this.cargarDocumentos();
      },
      error: () => {
        const mensaje = claveResultado === 'APPROVE'
          ? this.mensajes.FEEDBACK.APPROVE_ERROR
          : claveResultado === 'REJECT'
            ? this.mensajes.FEEDBACK.REJECT_ERROR
            : this.mensajes.FEEDBACK.DELETE_ERROR;
        this.mostrarMensaje(mensaje, true);
      }
    });
  }

  private mostrarMensaje(mensaje: string, esError: boolean): void {
    this.mensajeAccion.set(mensaje);
    this.errorAccion.set(esError);
  }

  private limpiarMensajeAccion(): void {
    this.mensajeAccion.set('');
    this.errorAccion.set(false);
  }

  private liberarVistaPrevia(): void {
    const url = this.vistaPreviaUrl();
    if (url) URL.revokeObjectURL(url);
    this.vistaPreviaUrl.set(null);
  }
}
