import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnChanges,
  SimpleChanges,
  inject
} from '@angular/core';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Observable,
  Subscription,
  catchError,
  forkJoin,
  map,
  of,
  switchMap
} from 'rxjs';

import {
  Materia
} from '../../../../../models/materia';

import {
  Docente
} from '../../../../../models/docente.model';

import {
  CalificacionDocenteGestionResumenResponse,
  CalificacionDocentePromedioResponse,
  CalificacionDocenteResponse,
  GestionDocente,
  RegistrarCalificacionDocenteRequest
} from '../../../../../models/calificacion-docente.model';

import {
  DocentesService
} from '../../../../../services/docentes.service';

import {
  CalificacionesDocenteService
} from '../../../../../services/calificaciones-docente.service';

import {
  LanguageService
} from '../../../../../services/language.service';

import {
  AuthService
} from '../../../../../services/auth.service';

import {
  MESSAGES
} from '../../../../../strings/materias/materias.messages';

import {
  MESSAGES_EN
} from '../../../../../strings/materias/materias-ingles.messages';

import {
  presentarNombreMateriaPorCodigo
} from '../../../../../utils/text.utils';

import {
  APP_CONFIG
} from '../../../../../config/app-config';

import {
  DOCENTES_MESSAGES
} from '../../../../../strings/materias/docentes.messages';

import {
  DOCENTES_MESSAGES_EN
} from '../../../../../strings/materias/docentes-ingles.messages';

type DocenteMessageKey = keyof typeof DOCENTES_MESSAGES;

interface DocenteConCalificacion {
  docente: Docente;
  calificacion: CalificacionDocenteResponse | null;
  promedio: CalificacionDocentePromedioResponse | null;
  estadoCalificacionDisponible: boolean;
}

type ModoFiltroDocentes = 'gestion' | 'rango';

interface ResultadoCargaDocentes {
  items: DocenteConCalificacion[];
  estadoCalificacionesIncompleto: boolean;
  errorPromedios: boolean;
}

interface HistorialDocenteGestion {
  gestion: GestionDocente;
  anio: number | null;
  cantidadEvaluaciones: number;
  claridad: number;
  metodologia: number;
  relacion: number;
}

type ContextoFiltroDocentes =
  | { tipo: 'gestion'; gestion: GestionDocente }
  | { tipo: 'rango'; desde: GestionDocente; hasta: GestionDocente };

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './docentes.component.html',
  styleUrl: './docentes.component.css'
})
export class DocentesComponent implements OnChanges {

  @Input({
    required: true
  })
  materia!: Materia;

  private readonly languageService = inject(LanguageService);
  private readonly authService = inject(AuthService);

  get mensajes() {
    return this.languageService.getMessages(
      DOCENTES_MESSAGES,
      DOCENTES_MESSAGES_EN
    );
  }

  nombreMateriaVisible(): string {
    return presentarNombreMateriaPorCodigo(
      this.materia.codigo,
      this.materia.nombre,
      this.languageService.getMessages(MESSAGES, MESSAGES_EN).SUBJECT_NAMES
    );
  }

  readonly escalaMaxima =
    APP_CONFIG.SCALE.RATING_TOTAL;

  readonly anchoGrafico = 1000;
  readonly altoGrafico = 280;
  readonly margenIzquierdo = 55;
  readonly margenDerecho = 25;
  readonly margenSuperior = 20;
  readonly margenInferior = 45;
  readonly nivelesGrafico = [0, 2, 4, 6, 8, 10];

  get criteriosCalificacion() {
    return [
      {
        control: 'claridadExplicaciones',
        label: this.mensajes.CLARITY_LABEL
      },
      {
        control: 'metodologia',
        label: this.mensajes.METHODOLOGY_LABEL
      },
      {
        control: 'relacionClasesEvaluaciones',
        label: this.mensajes.RELATION_LABEL
      }
    ] as const;
  }

  docentes: DocenteConCalificacion[] = [];

  docenteSeleccionado: Docente | null = null;

  calificacionSeleccionada:
    CalificacionDocenteResponse | null = null;

  cargando = false;
  cargandoPromedios = false;
  enviandoCalificacion = false;
  eliminandoCalificacion = false;

  error: DocenteMessageKey | '' = '';
  advertenciaEstado: DocenteMessageKey | '' = '';
  errorPromedios: DocenteMessageKey | '' = '';
  errorGestiones: DocenteMessageKey | '' = '';
  errorFiltro: DocenteMessageKey | '' = '';
  errorHistorial: DocenteMessageKey | '' = '';
  errorEnvio: DocenteMessageKey | '' = '';
  mensajeExito: DocenteMessageKey | '' = '';
  gestiones: GestionDocente[] = [];
  private historialGestiones: CalificacionDocenteGestionResumenResponse[] = [];
  cargandoGestiones = false;
  cargandoFiltro = false;
  modoFiltro: ModoFiltroDocentes = 'gestion';
  gestionSeleccionada: GestionDocente | '' = '';
  gestionDesde: GestionDocente | '' = '';
  gestionHasta: GestionDocente | '' = '';
  gestionAplicada: GestionDocente | null = null;
  private contextoFiltro: ContextoFiltroDocentes | null = null;
  filtroSinResultados = false;
  historialDocente: HistorialDocenteGestion[] = [];
  cargandoHistorial = false;

  get descripcionFiltro(): string {
    if (!this.contextoFiltro) {
      return '';
    }

    if (this.contextoFiltro.tipo === 'gestion') {
      return `${this.mensajes.FILTER_GESTION_CONTEXT} ${this.formatearGestionDocente(this.contextoFiltro.gestion)}`;
    }

    return `${this.mensajes.FILTER_RANGE_CONTEXT} ${this.formatearGestionDocente(this.contextoFiltro.desde)} ${this.mensajes.FILTER_RANGE_SEPARATOR} ${this.formatearGestionDocente(this.contextoFiltro.hasta)}`;
  }

  mostrarFormulario = false;
  mostrarConfirmacion = false;
  mostrarDetalle = false;
  mostrarConfirmacionEliminacion = false;

  modoEdicion = false;

  formularioCalificacion: FormGroup;

  readonly periodoActual:
    'I' | 'II' =
      new Date().getMonth() < 6
        ? 'I'
        : 'II';

  private get idEstudianteActual(): number {
    return this.authService.obtenerUsuario()?.id ?? 0;
  }

  private readonly destroyRef =
    inject(DestroyRef);

  private cargaDocentes?: Subscription;
  private cargaPromedios?: Subscription;
  private consultaFiltro?: Subscription;
  private cargaHistorial?: Subscription;

  constructor(
    private readonly docentesService:
      DocentesService,
    private readonly calificacionesDocenteService:
      CalificacionesDocenteService,
    private readonly formBuilder:
      FormBuilder,
    private readonly changeDetectorRef:
      ChangeDetectorRef
  ) {

    this.formularioCalificacion =
      this.formBuilder.group({

        claridadExplicaciones: [
          5,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(
              APP_CONFIG.SCALE.RATING_TOTAL
            )
          ]
        ],

        metodologia: [
          5,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(
              APP_CONFIG.SCALE.RATING_TOTAL
            )
          ]
        ],

        relacionClasesEvaluaciones: [
          5,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(
              APP_CONFIG.SCALE.RATING_TOTAL
            )
          ]
        ]
      });
  }

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['materia'] &&
      this.materia?.id
    ) {
      this.cargarDocentes();
    }
  }

  cargarDocentes(): void {

    this.cargaDocentes?.unsubscribe();
    this.cargaPromedios?.unsubscribe();
    this.consultaFiltro?.unsubscribe();
    this.cargaHistorial?.unsubscribe();
    this.cargando = true;
    this.cargandoPromedios = false;
    this.cargandoGestiones = true;
    this.cargandoFiltro = false;
    this.error = '';
    this.advertenciaEstado = '';
    this.errorPromedios = '';
    this.errorGestiones = '';
    this.errorFiltro = '';
    this.errorHistorial = '';
    this.gestiones = [];
    this.modoFiltro = 'gestion';
    this.gestionAplicada = null;
    this.contextoFiltro = null;
    this.filtroSinResultados = false;
    this.historialDocente = [];
    this.historialGestiones = [];
    this.docentes = [];

    this.cargarHistorialGestiones(true);

    this.cargaDocentes = this.docentesService
      .obtenerPorMateria(
        this.materia.id
      )
      .pipe(
        switchMap(
          (docentes) =>
            this.cargarDatosDocentes(docentes)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: (resultado) => {

          this.docentes =
            resultado.items;

          this.advertenciaEstado =
            resultado.estadoCalificacionesIncompleto
              ? 'STATUS_ERROR'
              : '';

          this.errorPromedios =
            resultado.errorPromedios
              ? 'AVERAGES_ERROR'
              : '';

          this.cargando = false;
          this.changeDetectorRef.detectChanges();
        },

        error: () => {

          this.error = 'LOAD_ERROR';

          this.cargando = false;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  reintentarPromedios(): void {

    this.cargaPromedios?.unsubscribe();
    this.cargandoPromedios = true;
    this.errorPromedios = '';
    this.gestionAplicada = null;
    this.contextoFiltro = null;
    this.filtroSinResultados = false;
    this.errorFiltro = '';
    this.cargarHistorialGestiones(false);
    this.cargaPromedios = this.calificacionesDocenteService
      .obtenerPromediosPorMateria(
        this.materia.id
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: (promedios) => {

          this.actualizarPromediosLocales(
            promedios
          );

          this.cargandoPromedios = false;
          this.changeDetectorRef.detectChanges();
        },

        error: () => {

          this.errorPromedios = 'AVERAGES_ERROR';

          this.cargandoPromedios = false;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  get gestionesRapidas(): GestionDocente[] {
    const conocidas = this.gestionesCronologicas.slice(-4).reverse();
    const noFechadas = this.historialGestiones
      .filter(gestion => gestion.anio === null)
      .map(gestion => gestion.gestion);
    return [...conocidas, ...noFechadas.slice(0, Math.max(0, 4 - conocidas.length))];
  }

  get gestionesCronologicas(): GestionDocente[] {
    return this.historialGestiones
      .filter(gestion => gestion.anio !== null)
      .map(gestion => gestion.gestion);
  }

  get gestionMasReciente(): GestionDocente | null {
    return this.gestionesCronologicas.at(-1) ?? null;
  }

  cambiarModoFiltro(modo: ModoFiltroDocentes): void {
    this.modoFiltro = modo;
    this.errorFiltro = '';
  }

  seleccionarGestionRapida(gestion: GestionDocente): void {
    this.modoFiltro = 'gestion';
    this.gestionSeleccionada = gestion;
    this.consultarPorGestion(gestion);
  }

  actualizarGestionSeleccionada(event: Event): void {
    this.gestionSeleccionada = (event.target as HTMLSelectElement).value as GestionDocente;
  }

  actualizarGestionDesde(event: Event): void {
    this.gestionDesde = (event.target as HTMLSelectElement).value as GestionDocente;
  }

  actualizarGestionHasta(event: Event): void {
    this.gestionHasta = (event.target as HTMLSelectElement).value as GestionDocente;
  }

  aplicarConsultaPersonalizada(): void {
    if (this.modoFiltro === 'gestion') {
      if (!this.gestionSeleccionada) {
        this.errorFiltro = 'FILTER_GESTION_REQUIRED';
        return;
      }

      this.consultarPorGestion(this.gestionSeleccionada);
      return;
    }

    if (!this.gestionDesde || !this.gestionHasta) {
      this.errorFiltro = 'FILTER_RANGE_REQUIRED';
      return;
    }

    const desde = this.gestionesCronologicas.indexOf(this.gestionDesde);
    const hasta = this.gestionesCronologicas.indexOf(this.gestionHasta);
    if (desde < 0 || hasta < 0 || desde > hasta) {
      this.errorFiltro = 'FILTER_RANGE_INVALID';
      return;
    }

    this.consultarPromedios(
      of(this.obtenerPromediosDelRango(this.gestionDesde, this.gestionHasta)),
      null,
        {
          tipo: 'rango',
          desde: this.gestionDesde,
          hasta: this.gestionHasta
        }
    );
  }

  formatearGestionDocente(gestion: GestionDocente): string {
    const gestionConAnio = /^(\d{4})-(I|II|1|2)$/i.exec(gestion.trim());
    if (gestionConAnio) {
      const semestre = this.normalizarSemestre(gestionConAnio[2]);
      return `${gestionConAnio[1]}-${semestre}`;
    }

    const semestre = this.obtenerSemestreSinAnio(gestion);
    return semestre
      ? `${this.mensajes.ACADEMIC_YEAR_PREFIX}${semestre}`
      : gestion;
  }

  esGestionActiva(gestion: GestionDocente): boolean {
    return this.gestionAplicada === gestion;
  }

  reintentarFiltro(): void {
    if (this.modoFiltro === 'rango') {
      this.aplicarConsultaPersonalizada();
    } else if (this.gestionSeleccionada) {
      this.consultarPorGestion(this.gestionSeleccionada);
    }
  }

  private consultarPorGestion(gestion: GestionDocente): void {
    this.consultarPromedios(
      of(this.obtenerPromediosDeGestion(gestion)),
      gestion,
      {
        tipo: 'gestion',
        gestion
      }
    );
  }

  private consultarPromedios(
    consulta: Observable<CalificacionDocentePromedioResponse[]>,
    gestion: GestionDocente | null,
    contexto: ContextoFiltroDocentes
  ): void {
    this.consultaFiltro?.unsubscribe();
    this.cargandoFiltro = true;
    this.errorFiltro = '';

    this.consultaFiltro = consulta
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: promedios => {
          this.actualizarPromediosLocales(promedios);
          this.gestionAplicada = gestion;
          this.contextoFiltro = contexto;
          this.filtroSinResultados = promedios.length === 0;
          this.cargandoFiltro = false;
          this.changeDetectorRef.detectChanges();
        },
        error: () => {
          this.errorFiltro = 'FILTER_ERROR';
          this.cargandoFiltro = false;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  obtenerPuntosHistorial(
    metrica: 'claridad' | 'metodologia' | 'relacion'
  ): string {
    return this.historialDocente
      .map((dato, indice) =>
        `${this.obtenerXHistorial(indice)},${this.obtenerYHistorial(dato[metrica])}`
      )
      .join(' ');
  }

  obtenerXHistorial(indice: number): number {
    if (this.historialDocente.length <= 1) {
      return this.anchoGrafico / 2;
    }

    const anchoDisponible =
      this.anchoGrafico - this.margenIzquierdo - this.margenDerecho;

    return this.margenIzquierdo +
      (anchoDisponible / (this.historialDocente.length - 1)) * indice;
  }

  obtenerYHistorial(valor: number): number {
    const altoDisponible =
      this.altoGrafico - this.margenSuperior - this.margenInferior;

    return this.margenSuperior + altoDisponible -
      (valor / this.escalaMaxima) * altoDisponible;
  }

  private cargarHistorialGestiones(mostrarCargaGestiones: boolean): void {
    this.cargaHistorial?.unsubscribe();
    this.errorHistorial = '';
    if (mostrarCargaGestiones) {
      this.cargandoGestiones = true;
    }
    this.cargandoHistorial = true;
    this.cargaHistorial = this.calificacionesDocenteService
      .obtenerHistorialGestionesPorMateria(this.materia.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: historial => {
          this.historialGestiones = [...historial].sort((primera, segunda) =>
            this.compararGestiones(primera, segunda)
          );
          this.gestiones = this.historialGestiones.map(gestion => gestion.gestion);
          this.gestionSeleccionada =
            this.gestionMasReciente ?? this.gestiones[0] ?? '';
          this.gestionDesde = this.gestionesCronologicas[0] ?? '';
          this.gestionHasta = this.gestionMasReciente ?? '';
          this.errorGestiones = '';
          this.cargarHistorialDocentes();
          this.cargandoGestiones = false;
          this.cargandoHistorial = false;
          this.changeDetectorRef.detectChanges();
        },
        error: () => {
          this.errorGestiones = 'GESTIONS_ERROR';
          this.errorHistorial = 'HISTORY_ERROR';
          this.cargandoGestiones = false;
          this.cargandoHistorial = false;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  private cargarHistorialDocentes(): void {
    this.historialDocente = this.historialGestiones.map(gestion => ({
      gestion: gestion.gestion,
      anio: gestion.anio,
      cantidadEvaluaciones: gestion.cantidadEvaluaciones,
      claridad: this.promedioDeDocentes(
        gestion.docentes,
        'claridadExplicacionesPromedio'
      ),
      metodologia: this.promedioDeDocentes(
        gestion.docentes,
        'metodologiaPromedio'
      ),
      relacion: this.promedioDeDocentes(
        gestion.docentes,
        'relacionClasesEvaluacionesPromedio'
      )
    }));
  }

  private compararGestiones(
    primera: CalificacionDocenteGestionResumenResponse,
    segunda: CalificacionDocenteGestionResumenResponse
  ): number {
    if (primera.anio !== null && segunda.anio !== null) {
      const porAnio = primera.anio - segunda.anio;
      if (porAnio !== 0) {
        return porAnio;
      }
    } else if (primera.anio !== null) {
      return -1;
    } else if (segunda.anio !== null) {
      return 1;
    }

    const ordenSemestre = (semestre: 'I' | 'II' | null): number =>
      semestre === 'I' ? 1 : semestre === 'II' ? 2 : 3;
    const porSemestre = ordenSemestre(primera.semestre) - ordenSemestre(segunda.semestre);
    return porSemestre || primera.gestion.localeCompare(segunda.gestion);
  }

  private obtenerPromediosDeGestion(
    gestion: GestionDocente
  ): CalificacionDocentePromedioResponse[] {
    const resumen = this.historialGestiones.find(item => item.gestion === gestion);
    return resumen?.docentes.map(docente => this.aPromedioDocente(
      docente,
      gestion,
      gestion
    )) ?? [];
  }

  private obtenerPromediosDelRango(
    desde: GestionDocente,
    hasta: GestionDocente
  ): CalificacionDocentePromedioResponse[] {
    const periodos = this.historialGestiones.filter(periodo => {
      if (periodo.anio === null) {
        return false;
      }
      const indice = this.gestionesCronologicas.indexOf(periodo.gestion);
      return indice >= this.gestionesCronologicas.indexOf(desde) &&
        indice <= this.gestionesCronologicas.indexOf(hasta);
    });
    const acumulados = new Map<number, {
      docente: CalificacionDocenteGestionResumenResponse['docentes'][number];
      cantidadEvaluaciones: number;
      claridad: number;
      metodologia: number;
      relacion: number;
    }>();

    for (const periodo of periodos) {
      for (const docente of periodo.docentes) {
        const acumulado = acumulados.get(docente.idDocente) ?? {
          docente,
          cantidadEvaluaciones: 0,
          claridad: 0,
          metodologia: 0,
          relacion: 0
        };
        acumulado.cantidadEvaluaciones += docente.cantidadEvaluaciones;
        acumulado.claridad +=
          docente.claridadExplicacionesPromedio * docente.cantidadEvaluaciones;
        acumulado.metodologia +=
          docente.metodologiaPromedio * docente.cantidadEvaluaciones;
        acumulado.relacion +=
          docente.relacionClasesEvaluacionesPromedio * docente.cantidadEvaluaciones;
        acumulados.set(docente.idDocente, acumulado);
      }
    }

    return [...acumulados.values()].map(({ docente, cantidadEvaluaciones, claridad, metodologia, relacion }) => ({
      idDocente: docente.idDocente,
      nombreDocente: docente.nombreDocente,
      gestionDesde: desde,
      gestionHasta: hasta,
      idMateria: this.materia.id,
      claridadExplicacionesPromedio: claridad / cantidadEvaluaciones,
      metodologiaPromedio: metodologia / cantidadEvaluaciones,
      relacionClasesEvaluacionesPromedio: relacion / cantidadEvaluaciones
    }));
  }

  private aPromedioDocente(
    docente: CalificacionDocenteGestionResumenResponse['docentes'][number],
    gestionDesde: GestionDocente,
    gestionHasta: GestionDocente
  ): CalificacionDocentePromedioResponse {
    return {
      idDocente: docente.idDocente,
      nombreDocente: docente.nombreDocente,
      gestionDesde,
      gestionHasta,
      idMateria: this.materia.id,
      claridadExplicacionesPromedio: docente.claridadExplicacionesPromedio,
      metodologiaPromedio: docente.metodologiaPromedio,
      relacionClasesEvaluacionesPromedio: docente.relacionClasesEvaluacionesPromedio
    };
  }

  private obtenerSemestreSinAnio(gestion: GestionDocente): 'I' | 'II' | null {
    const gestionSinAnio = gestion.trim().toLocaleLowerCase();
    const formatoApi = /^año-(i|ii)$/.exec(gestionSinAnio);
    const formatoInvertido = /^(i|ii)-año$/.exec(gestionSinAnio);
    const semestre = formatoApi?.[1] ?? formatoInvertido?.[1];

    return semestre ? this.normalizarSemestre(semestre) : null;
  }

  private normalizarSemestre(semestre: string): 'I' | 'II' {
    return semestre.toUpperCase() === '1' || semestre.toUpperCase() === 'I'
      ? 'I'
      : 'II';
  }

  private promedioDeDocentes(
    promedios: CalificacionDocenteGestionResumenResponse['docentes'],
    metrica: 'claridadExplicacionesPromedio' | 'metodologiaPromedio' | 'relacionClasesEvaluacionesPromedio'
  ): number {
    const cantidadEvaluaciones = promedios.reduce(
      (total, docente) => total + docente.cantidadEvaluaciones,
      0
    );
    if (cantidadEvaluaciones === 0) {
      return 0;
    }
    return promedios.reduce(
      (total, docente) =>
        total + docente[metrica] * docente.cantidadEvaluaciones,
      0
    ) / cantidadEvaluaciones;
  }

  abrirFormulario(
    docente: Docente
  ): void {

    this.docenteSeleccionado =
      docente;

    this.calificacionSeleccionada =
      null;

    this.modoEdicion = false;

    this.errorEnvio = '';
    this.mensajeExito = '';

    this.formularioCalificacion.reset({
      claridadExplicaciones: 5,
      metodologia: 5,
      relacionClasesEvaluaciones: 5
    });

    this.mostrarDetalle = false;
    this.mostrarConfirmacion = false;
    this.mostrarConfirmacionEliminacion = false;
    this.mostrarFormulario = true;

    this.changeDetectorRef.detectChanges();
  }

  abrirDetalle(
    item: DocenteConCalificacion
  ): void {

    if (!item.calificacion) {
      return;
    }

    this.docenteSeleccionado =
      item.docente;

    this.calificacionSeleccionada =
      item.calificacion;

    this.errorEnvio = '';

    this.mostrarFormulario = false;
    this.mostrarConfirmacion = false;
    this.mostrarConfirmacionEliminacion = false;
    this.mostrarDetalle = true;

    this.changeDetectorRef.detectChanges();
  }

  abrirEdicion(): void {

    if (
      !this.docenteSeleccionado ||
      !this.calificacionSeleccionada
    ) {
      return;
    }

    this.formularioCalificacion.setValue({
      claridadExplicaciones:
        this.calificacionSeleccionada.claridadExplicaciones,

      metodologia:
        this.calificacionSeleccionada.metodologia,

      relacionClasesEvaluaciones:
        this.calificacionSeleccionada.relacionClasesEvaluaciones
    });

    this.modoEdicion = true;
    this.errorEnvio = '';

    this.mostrarDetalle = false;
    this.mostrarConfirmacion = false;
    this.mostrarConfirmacionEliminacion = false;
    this.mostrarFormulario = true;

    this.changeDetectorRef.detectChanges();
  }

  cerrarModal(): void {

    if (
      this.enviandoCalificacion ||
      this.eliminandoCalificacion
    ) {
      return;
    }

    this.mostrarFormulario = false;
    this.mostrarConfirmacion = false;
    this.mostrarDetalle = false;
    this.mostrarConfirmacionEliminacion = false;

    this.modoEdicion = false;

    this.docenteSeleccionado = null;
    this.calificacionSeleccionada = null;

    this.errorEnvio = '';
  }

  continuarConfirmacion(): void {

    this.formularioCalificacion.markAllAsTouched();

    if (
      this.formularioCalificacion.invalid
    ) {
      return;
    }

    this.mostrarConfirmacion = true;
  }

  volverFormulario(): void {
    this.mostrarConfirmacion = false;
  }

  guardarCalificacion(): void {

    if (
      !this.docenteSeleccionado ||
      this.formularioCalificacion.invalid ||
      this.enviandoCalificacion
    ) {
      return;
    }

    if (
      this.modoEdicion &&
      this.calificacionSeleccionada
    ) {
      this.actualizarCalificacion();
      return;
    }

    this.registrarCalificacion();
  }

  abrirConfirmacionEliminacion(): void {
    this.errorEnvio = '';
    this.mostrarConfirmacionEliminacion = true;
  }

  cancelarEliminacion(): void {
    this.mostrarConfirmacionEliminacion = false;
  }

  eliminarCalificacion(): void {

    if (
      !this.docenteSeleccionado ||
      this.eliminandoCalificacion
    ) {
      return;
    }

    this.eliminandoCalificacion = true;
    this.errorEnvio = '';

    this.calificacionesDocenteService
      .eliminarCalificacion(
        this.idEstudianteActual,
        this.docenteSeleccionado.id,
        this.materia.id
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: () => {

          this.actualizarCalificacionLocal(
            this.docenteSeleccionado!.id,
            null
          );

          this.reintentarPromedios();

          this.eliminandoCalificacion = false;

          this.mostrarDetalle = false;
          this.mostrarConfirmacionEliminacion = false;

          this.docenteSeleccionado = null;
          this.calificacionSeleccionada = null;

          this.mensajeExito = 'DELETE_SUCCESS';

          this.changeDetectorRef.detectChanges();
        },

        error: () => {

          this.eliminandoCalificacion = false;

          this.errorEnvio = 'DELETE_ERROR';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  obtenerNombreVisible(
    docente: Docente
  ): string {
    return docente.nombre;
  }

  obtenerIdentificadorVisual(
    docente: Docente
  ): string {
    return docente.nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (parte) =>
          parte.charAt(0).toUpperCase()
      )
      .join('');
  }

  obtenerValor(
    control: string
  ): number {

    return Number(
      this.formularioCalificacion
        .get(control)
        ?.value ?? 0
    );
  }

  obtenerPromedioFormateado(
    promedio: number
  ): string {

    return promedio.toFixed(1);
  }

  obtenerPorcentaje(
    promedio: number
  ): number {

    return Math.max(
      0,
      Math.min(
        100,
        promedio / this.escalaMaxima * 100
      )
    );
  }

  obtenerPeriodoRegistrado(): string {

    return this.calificacionSeleccionada?.gestion.endsWith('-I')
        ? 'I'
        : 'II';
  }

  private registrarCalificacion(): void {

    const request =
      this.crearRequest(
        this.obtenerGestionBackendActual()
      );

    this.enviandoCalificacion = true;
    this.errorEnvio = '';

    this.calificacionesDocenteService
      .registrarCalificacion(
        request
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: (calificacion) => {

          this.actualizarCalificacionLocal(
            calificacion.idDocente,
            calificacion
          );

          this.reintentarPromedios();

          this.finalizarGuardado(
            'SUCCESS'
          );
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.enviandoCalificacion = false;

          this.errorEnvio =
            error.status === 409
              ? 'DUPLICATE_ERROR'
              : 'REGISTER_ERROR';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  private actualizarCalificacion(): void {

    if (
      !this.docenteSeleccionado ||
      !this.calificacionSeleccionada
    ) {
      return;
    }

    const request =
      this.crearRequest(
        this.calificacionSeleccionada.gestion
      );

    this.enviandoCalificacion = true;
    this.errorEnvio = '';

    this.calificacionesDocenteService
      .actualizarCalificacion(
        this.idEstudianteActual,
        this.docenteSeleccionado.id,
        this.materia.id,
        request
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: (calificacion) => {

          this.actualizarCalificacionLocal(
            calificacion.idDocente,
            calificacion
          );

          this.reintentarPromedios();

          this.finalizarGuardado(
            'UPDATE_SUCCESS'
          );
        },

        error: () => {

          this.enviandoCalificacion = false;

          this.errorEnvio = 'UPDATE_ERROR';

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  private crearRequest(
    gestion: GestionDocente
  ): RegistrarCalificacionDocenteRequest {

    const valores =
      this.formularioCalificacion.getRawValue();

    return {
      idDocente:
        this.docenteSeleccionado!.id,

      idMateria:
        this.materia.id,

      idEstudiante:
        this.idEstudianteActual,

      claridadExplicaciones:
        valores.claridadExplicaciones,

      metodologia:
        valores.metodologia,

      relacionClasesEvaluaciones:
        valores.relacionClasesEvaluaciones,

      gestion
    };
  }

  private finalizarGuardado(
    mensaje: DocenteMessageKey
  ): void {

    this.enviandoCalificacion = false;

    this.mostrarFormulario = false;
    this.mostrarConfirmacion = false;
    this.mostrarDetalle = false;

    this.modoEdicion = false;

    this.docenteSeleccionado = null;
    this.calificacionSeleccionada = null;

    this.mensajeExito =
      mensaje;

    this.changeDetectorRef.detectChanges();
  }

  private actualizarCalificacionLocal(
    idDocente: number,
    calificacion:
      CalificacionDocenteResponse | null
  ): void {

    const item =
      this.docentes.find(
        (actual) =>
          actual.docente.id === idDocente
      );

    if (item) {
      item.calificacion =
        calificacion;
    }
  }

  private cargarCalificaciones(
    docentes: Docente[]
  ): Observable<ResultadoCargaDocentes> {

    if (docentes.length === 0) {
      return of<ResultadoCargaDocentes>({
        items: [],
        estadoCalificacionesIncompleto: false,
        errorPromedios: false
      });
    }

    const consultas =
      docentes.map(
        (docente) =>
          this.calificacionesDocenteService
            .obtenerPorEstudiante(
              this.idEstudianteActual,
              docente.id,
              this.materia.id
            )
            .pipe(
              map(
                (calificacion) => ({
                  docente,
                  calificacion,
                  error: false
                })
              ),
              catchError(
                () => of({
                  docente,
                  calificacion: null,
                  error: true
                })
              )
            )
      );

    return forkJoin(
      consultas
    ).pipe(
      map(
        (resultados): ResultadoCargaDocentes => ({
          items: resultados.map(
            ({ docente, calificacion, error }) => ({
              docente,
              calificacion,
              promedio: null,
              estadoCalificacionDisponible: !error
            })
          ),
          estadoCalificacionesIncompleto:
            resultados.some(
              (resultado) => resultado.error
            ),
          errorPromedios: false
        })
      )
    );
  }

  private cargarDatosDocentes(
    docentes: Docente[]
  ): Observable<ResultadoCargaDocentes> {

    if (docentes.length === 0) {
      return this.cargarCalificaciones(docentes);
    }

    return forkJoin({
      estadoEvaluaciones:
        this.cargarCalificaciones(docentes),

      promedios:
        this.calificacionesDocenteService
          .obtenerPromediosPorMateria(
            this.materia.id
          )
          .pipe(
            map(
              (items) => ({
                items,
                error: false
              })
            ),
            catchError(
              () => of({
                items: [] as CalificacionDocentePromedioResponse[],
                error: true
              })
            )
          )
    }).pipe(
      map(
        ({ estadoEvaluaciones, promedios }) => {

          const promediosPorDocente = new Map(
            promedios.items.map(
              (promedio) => [
                promedio.idDocente,
                promedio
              ]
            )
          );

          return {
            items: this.combinarConPromedios(
              estadoEvaluaciones.items,
              promediosPorDocente
            ),
            estadoCalificacionesIncompleto:
              estadoEvaluaciones.estadoCalificacionesIncompleto,
            errorPromedios: promedios.error
          };
        }
      )
    );
  }

  private actualizarPromediosLocales(
    promedios: CalificacionDocentePromedioResponse[]
  ): void {

    const promediosPorDocente = new Map(
      promedios.map(
        (promedio) => [
          promedio.idDocente,
          promedio
        ]
      )
    );

    this.docentes = this.combinarConPromedios(
      this.docentes,
      promediosPorDocente
    );
  }

  private combinarConPromedios(
    docentes: DocenteConCalificacion[],
    promediosPorDocente: Map<
      number,
      CalificacionDocentePromedioResponse
    >
  ): DocenteConCalificacion[] {

    return docentes.map(
      (item) => ({
        ...item,
        promedio:
          promediosPorDocente.get(
            item.docente.id
          ) ?? null
      })
    );
  }

  private obtenerGestionBackendActual():
    GestionDocente {

    const anioActual = new Date().getFullYear();

    return this.periodoActual === 'I'
      ? `${anioActual}-I`
      : `${anioActual}-II`;
  }

}
