import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, startWith, Subject, switchMap, tap } from 'rxjs';

import { MaterialResponse } from '../../../../../models/material.model';
import { ApiService } from '../../../../../services/api';
import { LanguageService } from '../../../../../services/language.service';
import { MESSAGES } from '../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../strings/materias/materias-ingles.messages';
import { AgregarMaterialModalComponent } from './agregar-material-modal/agregar-material-modal.component';

export interface MaterialAcademico {
  id: string;
  linkMaterial: string;
  estado: string;
  titulo: string;
  descripcion: string;
  docente: { id: string; nombre: string };
  semestre: { id: string; etiqueta: string } | null;
  tipo: { id: string; etiqueta: string; etiquetaEn?: string };
}

@Component({
  selector: 'app-materiales',
  standalone: true,
  templateUrl: './materiales.component.html',
  styleUrl: './materiales.component.css',
  imports: [AgregarMaterialModalComponent]
})
export class MaterialesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly recargar = new Subject<void>();

  readonly idMateria = input.required<number>();
  readonly materiales = signal<MaterialAcademico[]>([]);
  readonly catalogo = signal<MaterialAcademico[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal(false);
  readonly procesandoAccion = signal(false);
  readonly mensajeAccion = signal('');
  readonly errorAccion = signal(false);
  readonly vistaPreviaUrl = signal<string | null>(null);
  readonly vistaPreviaUrlSegura = computed(() => {
    const url = this.vistaPreviaUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  readonly vistaPreviaEsPdf = signal(false);
  readonly vistaPreviaTitulo = signal('');
  readonly dialogoVistaPrevia = viewChild<ElementRef<HTMLDialogElement>>('dialogoVistaPrevia');
  readonly docenteSeleccionado = signal('');
  readonly semestreSeleccionado = signal('');
  readonly tipoSeleccionado = signal('');
  readonly modalAbierto = signal(false);

  readonly docentes = computed(() => this.opciones('docente'));
  readonly semestres = computed(() => this.opciones('semestre'));
  readonly tipos = computed(() => this.opciones('tipo'));
  readonly materialesVisibles = computed(() => this.materiales());

  private readonly sincronizarDialogo = effect(() => {
    const dialogo = this.dialogoVistaPrevia()?.nativeElement;
    if (!dialogo) return;

    if (this.vistaPreviaUrl() && !dialogo.open) dialogo.showModal();
    if (!this.vistaPreviaUrl() && dialogo.open) dialogo.close();
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      const url = this.vistaPreviaUrl();
      if (url) URL.revokeObjectURL(url);
    });
  }

  ngOnInit(): void {
    this.recargar.pipe(
      startWith(undefined),
      switchMap(() => {
        const filtros = this.filtrosApi();
        const catalogoCompleto = Object.keys(filtros).length === 0;
        this.cargando.set(true);
        this.errorCarga.set(false);

        return this.api.obtenerMateriales(this.idMateria(), filtros).pipe(
          tap(respuesta => {
            const materiales = respuesta.map(material => this.mapearMaterial(material));
            this.materiales.set(materiales);
            if (catalogoCompleto) this.catalogo.set(materiales);
          }),
          catchError(() => {
            this.errorCarga.set(true);
            this.materiales.set([]);
            return EMPTY;
          }),
          finalize(() => this.cargando.set(false))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  get MESSAGES() {
    return this.languageService.getMessages(MESSAGES, MESSAGES_EN);
  }

  etiquetaTipo(material: MaterialAcademico): string {
    const etiquetasApi: Record<string, string> = {
      IMAGEN: this.MESSAGES.MATERIAL_TYPE_IMAGE,
      WORD: this.MESSAGES.MATERIAL_TYPE_WORD,
      PDF: this.MESSAGES.MATERIAL_TYPE_PDF,
      POWERPOINT: this.MESSAGES.MATERIAL_TYPE_POWERPOINT
    };
    if (etiquetasApi[material.tipo.id]) return etiquetasApi[material.tipo.id];
    return this.languageService.isEnglish()
      ? material.tipo.etiquetaEn ?? material.tipo.etiqueta
      : material.tipo.etiqueta;
  }

  descargar(material: MaterialAcademico): void {
    if (material.estado !== 'ACTIVO' || this.procesandoAccion()) return;

    this.procesandoAccion.set(true);
    this.mensajeAccion.set(this.MESSAGES.MATERIAL_DOWNLOAD_LOADING);
    this.errorAccion.set(false);
    this.api.descargarMaterial(Number(material.id)).pipe(
      finalize(() => this.procesandoAccion.set(false))
    ).subscribe({
      next: respuesta => {
        const archivo = respuesta.body;
        const tipoContenido = (respuesta.headers.get('Content-Type') ?? archivo?.type ?? '')
          .split(';')[0].trim().toLowerCase();
        if (!archivo || tipoContenido === 'application/json' || tipoContenido.startsWith('text/')) {
          this.mostrarErrorAccion();
          return;
        }

        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = this.nombreArchivo(respuesta.headers.get('Content-Disposition'), material.linkMaterial);
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
        this.mensajeAccion.set(this.MESSAGES.MATERIAL_DOWNLOAD_SUCCESS);
      },
      error: () => this.mostrarErrorAccion()
    });
  }

  ver(material: MaterialAcademico): void {
    if (material.estado !== 'ACTIVO' || this.procesandoAccion()) return;
    if (material.tipo.id !== 'PDF' && material.tipo.id !== 'IMAGEN') {
      this.mensajeAccion.set(this.MESSAGES.MATERIAL_PREVIEW_UNAVAILABLE);
      this.errorAccion.set(false);
      return;
    }

    this.procesandoAccion.set(true);
    this.mensajeAccion.set(this.MESSAGES.MATERIAL_PREVIEW_LOADING);
    this.errorAccion.set(false);
    this.api.descargarMaterial(Number(material.id)).pipe(
      finalize(() => this.procesandoAccion.set(false))
    ).subscribe({
      next: respuesta => {
        const archivo = respuesta.body;
        const tipoContenido = (archivo?.type ?? '').toLowerCase();
        const esPdf = material.tipo.id === 'PDF' && tipoContenido === 'application/pdf';
        const esImagen = material.tipo.id === 'IMAGEN' && tipoContenido.startsWith('image/');
        if (!archivo || (!esPdf && !esImagen)) {
          this.mostrarErrorAccion();
          return;
        }

        this.liberarVistaPrevia();
        this.vistaPreviaEsPdf.set(esPdf);
        this.vistaPreviaTitulo.set(material.titulo);
        this.vistaPreviaUrl.set(URL.createObjectURL(archivo));
        this.mensajeAccion.set('');
      },
      error: () => this.mostrarErrorAccion()
    });
  }

  cerrarVistaPrevia(): void {
    this.liberarVistaPrevia();
  }

  actualizarDocente(event: Event): void {
    this.docenteSeleccionado.set((event.target as HTMLSelectElement).value);
    this.recargar.next();
  }

  actualizarSemestre(event: Event): void {
    this.semestreSeleccionado.set((event.target as HTMLSelectElement).value);
    this.recargar.next();
  }

  actualizarTipo(event: Event): void {
    this.tipoSeleccionado.set((event.target as HTMLSelectElement).value);
    this.recargar.next();
  }

  abrirModal(): void {
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  recargarMateriales(): void {
    this.recargar.next();
  }

  private filtrosApi(): { idDocente?: number; semestre?: number; tipo?: string } {
    const docente = this.docenteSeleccionado();
    const semestre = this.semestreSeleccionado();
    const tipo = this.tipoSeleccionado();
    return {
      ...(docente ? { idDocente: Number(docente) } : {}),
      ...(semestre ? { semestre: Number(semestre) } : {}),
      ...(tipo ? { tipo } : {})
    };
  }

  private mapearMaterial(material: MaterialResponse): MaterialAcademico {
    return {
      id: String(material.id),
      linkMaterial: material.linkMaterial,
      estado: material.estado,
      titulo: material.titulo,
      descripcion: material.descripcion,
      docente: { id: String(material.idDocente), nombre: material.nombreDocente },
      semestre: material.semestreIngresado === null
        ? null
        : { id: String(material.semestreIngresado), etiqueta: String(material.semestreIngresado) },
      tipo: { id: material.tipo, etiqueta: material.tipo }
    };
  }

  private nombreArchivo(contentDisposition: string | null, linkMaterial: string): string {
    const filenameStar = contentDisposition?.match(/filename\*\s*=\s*([^;]+)/i)?.[1]
      ?.trim().replace(/^"|"$/g, '').replace(/^UTF-8''/i, '');
    const filename = filenameStar
      ? this.decodificarNombre(filenameStar)
      : contentDisposition?.match(/filename\s*=\s*(?:"([^"]+)"|([^;]+))/i)?.slice(1).find(Boolean)?.trim();
    return filename || this.nombreDesdeUrl(linkMaterial);
  }

  private decodificarNombre(nombre: string): string {
    try {
      return decodeURIComponent(nombre);
    } catch {
      return nombre;
    }
  }

  private nombreDesdeUrl(linkMaterial: string): string {
    try {
      const segmento = new URL(linkMaterial, document.baseURI).pathname.split('/').pop() ?? '';
      const nombre = this.decodificarNombre(segmento);
      return nombre.replace(/^[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}-/, '') || 'material';
    } catch {
      return 'material';
    }
  }

  private mostrarErrorAccion(): void {
    this.mensajeAccion.set(this.MESSAGES.MATERIAL_ACTION_ERROR);
    this.errorAccion.set(true);
  }

  private liberarVistaPrevia(): void {
    const url = this.vistaPreviaUrl();
    if (url) URL.revokeObjectURL(url);
    this.vistaPreviaUrl.set(null);
    this.vistaPreviaEsPdf.set(false);
    this.vistaPreviaTitulo.set('');
  }

  private opciones(campo: 'docente' | 'semestre' | 'tipo') {
    const opciones = new Map<string, string>();
    for (const material of this.catalogo()) {
      if (campo === 'docente') {
        opciones.set(material.docente.id, material.docente.nombre);
      } else if (campo === 'semestre') {
        if (material.semestre) opciones.set(material.semestre.id, material.semestre.etiqueta);
      } else {
        opciones.set(material.tipo.id, this.etiquetaTipo(material));
      }
    }
    return [...opciones].map(([id, etiqueta]) => ({ id, etiqueta }));
  }
}
