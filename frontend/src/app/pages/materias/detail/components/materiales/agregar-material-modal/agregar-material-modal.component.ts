import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, tap } from 'rxjs';

import { Materia } from '../../../../../../models/materia';
import { Docente } from '../../../../../../models/docente.model';
import {
  MaterialSubidoResponse
} from '../../../../../../models/material.model';
import { MateriasService } from '../../../../../../services/materias.service';
import { DocentesService } from '../../../../../../services/docentes.service';
import { ApiService } from '../../../../../../services/api';
import { AuthService } from '../../../../../../services/auth.service';
import { LanguageService } from '../../../../../../services/language.service';
import { MESSAGES } from '../../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../../strings/materias/materias-ingles.messages';

export type TipoArchivo = 'IMAGEN' | 'WORD' | 'PDF' | 'POWERPOINT';

const EXTENSIONES_POR_TIPO: Record<TipoArchivo, string[]> = {
  IMAGEN: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
  WORD: ['doc', 'docx'],
  PDF: ['pdf'],
  POWERPOINT: ['ppt', 'pptx']
};

const TAMANIO_MAXIMO_BYTES = 20 * 1024 * 1024;

const SEMESTRES = Array.from({ length: 20 }, (_, indice) => indice + 1);

const TIPO_OPCIONES: TipoArchivo[] = ['IMAGEN', 'WORD', 'PDF', 'POWERPOINT'];

function requeridoSinEspacios(control: {
  value: unknown;
}): { requerido: boolean } | null {
  const valor = String(control.value ?? '').trim();
  return valor.length === 0 ? { requerido: true } : null;
}

function detectarTipoPorExtension(nombreArchivo: string): TipoArchivo | null {
  const extension = nombreArchivo
    .slice(nombreArchivo.lastIndexOf('.') + 1)
    .toLowerCase();
  for (const tipo of TIPO_OPCIONES) {
    if (EXTENSIONES_POR_TIPO[tipo].includes(extension)) {
      return tipo;
    }
  }
  return null;
}

@Component({
  selector: 'app-agregar-material-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './agregar-material-modal.component.html',
  styleUrl: './agregar-material-modal.component.css'
})
export class AgregarMaterialModalComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly materiasService = inject(MateriasService);
  private readonly docentesService = inject(DocentesService);
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  readonly idMateria = input<number | null>(null);
  readonly abierto = input<boolean>(false);
  readonly cerrar = output<void>();
  readonly materialEnviado = output<void>();

  get MESSAGES() {
    return this.languageService.getMessages(MESSAGES, MESSAGES_EN);
  }

  readonly materias = signal<Materia[]>([]);
  readonly docentes = signal<Docente[]>([]);
  readonly semestres = SEMESTRES;
  readonly tipoOpciones = TIPO_OPCIONES;

  readonly enviando = signal(false);
  readonly exito = signal(false);
  readonly errorGeneral = signal<string | null>(null);
  readonly archivoSeleccionado = signal<File | null>(null);
  readonly nombreArchivo = signal('');

  readonly formulario = this.formBuilder.group({
    idMateria: [null as number | null, [Validators.required]],
    idDocente: [null as number | null, [Validators.required]],
    semestreIngresado: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(20)]
    ],
    tipo: ['' as TipoArchivo | '', [Validators.required]],
    titulo: ['', [Validators.required, requeridoSinEspacios]],
    descripcion: ['', [Validators.required, requeridoSinEspacios]],
    archivo: [null as File | null, [Validators.required]]
  });

  constructor() {
    effect(() => {
      if (this.abierto()) {
        untracked(() => this.abrir());
      }
    });
  }

  private abrir(): void {
    this.errorGeneral.set(null);
    this.exito.set(false);
    this.nombreArchivo.set('');
    this.archivoSeleccionado.set(null);
    this.formulario.reset({
      idMateria: this.idMateria() ?? null,
      idDocente: null,
      semestreIngresado: null,
      tipo: '',
      titulo: '',
      descripcion: '',
      archivo: null
    });
    this.cargarMaterias();
    this.cargarDocentes(this.idMateria() ?? undefined);
    this.presetearDesdeMateriaEntrada();
    this.changeDetectorRef.markForCheck();
  }

  private presetearDesdeMateriaEntrada(): void {
    const idMateria = this.idMateria();
    if (!idMateria) return;
    const materia = this.materias().find((m) => m.id === idMateria);
    if (!materia) return;
    this.formulario.get('idMateria')?.setValue(materia.id);
    const semestre = materia.semestre;
    if (semestre != null && semestre >= 1 && semestre <= 20) {
      this.formulario.get('semestreIngresado')?.setValue(semestre);
    }
  }

  private cargarMaterias(): void {
    this.materiasService
      .obtenerMaterias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (materias) => this.materias.set(materias),
        error: () => this.materias.set([])
      });
  }

  private cargarDocentes(idMateria?: number): void {
    if (!idMateria) {
      this.docentes.set([]);
      return;
    }
    this.docentesService
      .obtenerPorMateria(idMateria)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (docentes) => this.docentes.set(docentes),
        error: () => this.docentes.set([])
      });
  }

  onMateriaSeleccionada(event: Event): void {
    const id = (event.target as HTMLSelectElement)?.value ?? '';
    const idMateria = Number(id);
    this.formulario.get('idMateria')?.setValue(idMateria > 0 ? idMateria : null);
    this.formulario.get('idDocente')?.setValue(null);
    this.cargarDocentes(idMateria > 0 ? idMateria : undefined);

    const materia = this.materias().find((m) => m.id === idMateria);
    const semestre = materia?.semestre;
    this.formulario
      .get('semestreIngresado')
      ?.setValue(semestre != null && semestre >= 1 && semestre <= 20 ? semestre : null);
  }

  onTipoSeleccionado(event: Event): void {
    const tipo = (event.target as HTMLSelectElement)?.value as TipoArchivo | '';
    this.formulario.get('tipo')?.setValue(tipo);
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const archivo = input?.files?.[0] ?? null;
    if (!archivo) {
      return;
    }

    this.errorGeneral.set(null);

    if (archivo.size === 0) {
      this.formulario.get('archivo')?.setErrors({ vacio: true });
      this.formulario.get('archivo')?.markAsTouched();
      return;
    }

    if (archivo.size > TAMANIO_MAXIMO_BYTES) {
      this.formulario.get('archivo')?.setErrors({ tamaño: true });
      this.formulario.get('archivo')?.markAsTouched();
      return;
    }

    const tipoDetectado = detectarTipoPorExtension(archivo.name);
    if (!tipoDetectado) {
      this.formulario.get('archivo')?.setErrors({ extension: true });
      this.formulario.get('archivo')?.markAsTouched();
      return;
    }

    const erroresPrevios = this.formulario.get('archivo')?.errors ?? {};
    const erroresValidos = Object.fromEntries(
      Object.entries(erroresPrevios).filter(
        ([clave]) => !['vacio', 'tamaño', 'extension'].includes(clave)
      )
    );
    this.formulario.get('archivo')?.setErrors(
      Object.keys(erroresValidos).length > 0 ? erroresValidos : null
    );

    this.archivoSeleccionado.set(archivo);
    this.nombreArchivo.set(archivo.name);
    this.formulario.get('archivo')?.setValue(archivo);
    this.formulario.get('tipo')?.setValue(tipoDetectado);
  }

  removerArchivo(): void {
    this.archivoSeleccionado.set(null);
    this.nombreArchivo.set('');
    this.formulario.get('archivo')?.setValue(null);
    this.formulario.get('archivo')?.setErrors(null);
    this.formulario.get('tipo')?.setValue('');
  }

  campoInvalido(nombre: string): boolean {
    const control = this.formulario.get(nombre);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  errorCampo(nombre: string): string {
    const control = this.formulario.get(nombre);
    const errores = control?.errors;
    if (!errores) return '';

    if (errores['required'] || errores['requerido']) {
      return this.MESSAGES.MATERIAL_ERROR_CAMPO_REQUERIDO;
    }
    if (nombre === 'archivo') {
      if (errores['vacio']) return this.MESSAGES.MATERIAL_ERROR_ARCHIVO_REQUERIDO;
      if (errores['tamaño']) return this.MESSAGES.MATERIAL_ERROR_TAMANIO_EXCEDIDO;
      if (errores['extension']) return this.MESSAGES.MATERIAL_ERROR_EXTENSION_NO_PERMITIDA;
    }
    if (nombre === 'semestreIngresado' && (errores['min'] || errores['max'])) {
      return this.MESSAGES.MATERIAL_ERROR_SEMESTRE_INVALIDO;
    }
    return this.MESSAGES.MATERIAL_ERROR_CAMPO_REQUERIDO;
  }

  esTipoInconsistente(): boolean {
    const archivo = this.archivoSeleccionado();
    const tipo = this.formulario.get('tipo')?.value as TipoArchivo | '';
    if (!archivo || !tipo) return false;
    const tipoDetectado = detectarTipoPorExtension(archivo.name);
    return tipoDetectado !== null && tipoDetectado !== tipo;
  }

  enviar(): void {
    if (this.enviando() || this.exito()) return;

    this.errorGeneral.set(null);
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) return;

    const archivo = this.archivoSeleccionado();
    if (!archivo) {
      this.formulario.get('archivo')?.setErrors({ requerido: true });
      this.formulario.get('archivo')?.markAsTouched();
      return;
    }

    if (this.esTipoInconsistente()) {
      this.errorGeneral.set(this.MESSAGES.MATERIAL_ERROR_TIPO_ARCHIVO_INCONSISTENTE);
      return;
    }

    const usuario = this.authService.obtenerUsuario();
    if (!usuario || usuario.id == null) {
      this.errorGeneral.set(this.MESSAGES.MATERIAL_ERROR_SIN_SESION);
      return;
    }

    const formData = new FormData();
    formData.append('documento', archivo);
    formData.append('titulo', String(this.formulario.get('titulo')?.value).trim());
    formData.append(
      'descripcion',
      String(this.formulario.get('descripcion')?.value).trim()
    );
    formData.append(
      'idMateria',
      String(this.formulario.get('idMateria')?.value ?? '')
    );
    formData.append(
      'idDocente',
      String(this.formulario.get('idDocente')?.value ?? '')
    );
    const semestre = this.formulario.get('semestreIngresado')?.value;
    if (semestre != null) {
      formData.append('semestreIngresado', String(semestre));
    }
    formData.append('idEstudiante', String(usuario.id));

    this.enviando.set(true);

    this.api
      .subirMaterial(formData)
      .pipe(
        tap(() => {
          this.enviando.set(false);
          this.exito.set(true);
          this.materialEnviado.emit();
        }),
        catchError((error) => {
          this.enviando.set(false);
          this.errorGeneral.set(this.mapearError(error));
          return EMPTY;
        }),
        finalize(() => {
          this.enviando.set(false);
        })
      )
      .subscribe();
  }

  private mapearError(error: unknown): string {
    const status =
      error && typeof error === 'object' && 'status' in error
        ? (error as { status: number }).status
        : 0;

    switch (status) {
      case 400:
        return this.MESSAGES.MATERIAL_ERROR_ENVIO;
      case 401:
        return this.MESSAGES.MATERIAL_ERROR_SIN_SESION;
      case 403:
        return this.MESSAGES.MATERIAL_ERROR_ENVIO;
      case 404:
        return this.MESSAGES.MATERIAL_ERROR_ENVIO;
      case 413:
        return this.MESSAGES.MATERIAL_ERROR_TAMANIO_EXCEDIDO;
      case 502:
        return this.MESSAGES.MATERIAL_ERROR_ENVIO;
      default:
        return this.MESSAGES.MATERIAL_ERROR_ENVIO;
    }
  }

  etiquetaTipo(id: TipoArchivo): string {
    switch (id) {
      case 'IMAGEN':
        return this.MESSAGES.MATERIAL_TYPE_IMAGE;
      case 'WORD':
        return this.MESSAGES.MATERIAL_TYPE_WORD;
      case 'PDF':
        return this.MESSAGES.MATERIAL_TYPE_PDF;
      case 'POWERPOINT':
        return this.MESSAGES.MATERIAL_TYPE_POWERPOINT;
    }
    return id;
  }

  cerrarModal(): void {
    this.enviando.set(false);
    this.exito.set(false);
    this.errorGeneral.set(null);
    this.cerrar.emit();
  }
}
