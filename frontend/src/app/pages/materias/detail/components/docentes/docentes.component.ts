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
  APP_CONFIG
} from '../../../../../config/app-config';

import {
  DOCENTES_MESSAGES
} from '../../../../../strings/materias/docentes.messages';

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

interface ResultadoHistorialGestion {
  gestion: GestionDocente;
  promedios: CalificacionDocentePromedioResponse[] | null;
}

interface HistorialDocenteGestion {
  gestion: GestionDocente;
  claridad: number;
  metodologia: number;
  relacion: number;
}

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

  readonly mensajes =
    DOCENTES_MESSAGES;

  readonly escalaMaxima =
    APP_CONFIG.SCALE.RATING_TOTAL;

  readonly anchoGrafico = 1000;
  readonly altoGrafico = 280;
  readonly margenIzquierdo = 55;
  readonly margenDerecho = 25;
  readonly margenSuperior = 20;
  readonly margenInferior = 45;
  readonly nivelesGrafico = [0, 2, 4, 6, 8, 10];

  readonly criteriosCalificacion = [
    {
      control: 'claridadExplicaciones',
      label: DOCENTES_MESSAGES.CLARITY_LABEL
    },
    {
      control: 'metodologia',
      label: DOCENTES_MESSAGES.METHODOLOGY_LABEL
    },
    {
      control: 'relacionClasesEvaluaciones',
      label: DOCENTES_MESSAGES.RELATION_LABEL
    }
  ] as const;

  docentes: DocenteConCalificacion[] = [];

  docenteSeleccionado: Docente | null = null;

  calificacionSeleccionada:
    CalificacionDocenteResponse | null = null;

  cargando = false;
  cargandoPromedios = false;
  enviandoCalificacion = false;
  eliminandoCalificacion = false;

  error = '';
  advertenciaEstado = '';
  errorPromedios = '';
  errorGestiones = '';
  errorFiltro = '';
  errorHistorial = '';
  errorEnvio = '';
  mensajeExito = '';
  gestiones: GestionDocente[] = [];
  cargandoGestiones = false;
  cargandoFiltro = false;
  modoFiltro: ModoFiltroDocentes = 'gestion';
  gestionSeleccionada: GestionDocente | '' = '';
  gestionDesde: GestionDocente | '' = '';
  gestionHasta: GestionDocente | '' = '';
  gestionAplicada: GestionDocente | null = null;
  descripcionFiltro = '';
  filtroSinResultados = false;
  historialDocente: HistorialDocenteGestion[] = [];
  cargandoHistorial = false;

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

  private readonly idEstudianteActual =
    APP_CONFIG.DEMO.STUDENT_ID;

  private readonly destroyRef =
    inject(DestroyRef);

  private cargaDocentes?: Subscription;
  private cargaPromedios?: Subscription;
  private cargaGestiones?: Subscription;
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
    this.cargaGestiones?.unsubscribe();
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
    this.gestionAplicada = null;
    this.descripcionFiltro = '';
    this.filtroSinResultados = false;
    this.historialDocente = [];
    this.docentes = [];

    this.cargaGestiones = this.calificacionesDocenteService
      .obtenerGestionesPorMateria(this.materia.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: gestiones => {
          this.gestiones = gestiones;
          this.gestionSeleccionada = gestiones.at(-1) ?? '';
          this.gestionDesde = gestiones[0] ?? '';
          this.gestionHasta = gestiones.at(-1) ?? '';
          this.cargandoGestiones = false;
          this.cargarHistorialDocentes(gestiones);
          this.changeDetectorRef.detectChanges();
        },
        error: () => {
          this.errorGestiones = this.mensajes.GESTIONS_ERROR;
          this.cargandoGestiones = false;
        }
      });

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
              ? this.mensajes.STATUS_ERROR
              : '';

          this.errorPromedios =
            resultado.errorPromedios
              ? this.mensajes.AVERAGES_ERROR
              : '';

          this.cargando = false;
          this.changeDetectorRef.detectChanges();
        },

        error: () => {

          this.error =
            this.mensajes.LOAD_ERROR;

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
    this.descripcionFiltro = '';
    this.filtroSinResultados = false;
    this.errorFiltro = '';
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

          this.errorPromedios =
            this.mensajes.AVERAGES_ERROR;

          this.cargandoPromedios = false;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  get gestionesRapidas(): GestionDocente[] {
    return [...this.gestiones].reverse().slice(0, 4);
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
        this.errorFiltro = this.mensajes.FILTER_GESTION_REQUIRED;
        return;
      }

      this.consultarPorGestion(this.gestionSeleccionada);
      return;
    }

    if (!this.gestionDesde || !this.gestionHasta) {
      this.errorFiltro = this.mensajes.FILTER_RANGE_REQUIRED;
      return;
    }

    if (this.gestiones.indexOf(this.gestionDesde) > this.gestiones.indexOf(this.gestionHasta)) {
      this.errorFiltro = this.mensajes.FILTER_RANGE_INVALID;
      return;
    }

    this.consultarPromedios(
      this.calificacionesDocenteService.obtenerPromediosPorRango(
        this.materia.id,
        this.gestionDesde,
        this.gestionHasta
      ),
      null,
      `${this.mensajes.FILTER_RANGE_CONTEXT} ${this.formatearGestionDocente(this.gestionDesde)} ${this.mensajes.FILTER_RANGE_SEPARATOR} ${this.formatearGestionDocente(this.gestionHasta)}`
    );
  }

  formatearGestionDocente(gestion: GestionDocente): string {
    return gestion.replace('aÃ±o-', 'AÃ±o ');
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
      this.calificacionesDocenteService.obtenerPromediosPorGestion(
        this.materia.id,
        gestion
      ),
      gestion,
      `${this.mensajes.FILTER_GESTION_CONTEXT} ${this.formatearGestionDocente(gestion)}`
    );
  }

  private consultarPromedios(
    consulta: Observable<CalificacionDocentePromedioResponse[]>,
    gestion: GestionDocente | null,
    descripcion: string
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
          this.descripcionFiltro = descripcion;
          this.filtroSinResultados = promedios.length === 0;
          this.cargandoFiltro = false;
          this.changeDetectorRef.detectChanges();
        },
        error: () => {
          this.errorFiltro = this.mensajes.FILTER_ERROR;
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

  private cargarHistorialDocentes(gestiones: GestionDocente[]): void {
    this.cargaHistorial?.unsubscribe();
    this.errorHistorial = '';
    this.historialDocente = [];

    if (gestiones.length < 2) {
      this.cargandoHistorial = false;
      return;
    }

    this.cargandoHistorial = true;
    const consultas = gestiones.map(gestion =>
      this.calificacionesDocenteService
        .obtenerPromediosPorGestion(this.materia.id, gestion)
        .pipe(
          map(promedios => ({ gestion, promedios })),
          catchError(() => of({ gestion, promedios: null }))
        )
    );

    this.cargaHistorial = forkJoin(consultas)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultados: ResultadoHistorialGestion[]) => {
          this.errorHistorial = resultados.some(resultado => resultado.promedios === null)
            ? this.mensajes.HISTORY_ERROR
            : '';

          this.historialDocente = resultados
            .filter((resultado): resultado is {
              gestion: GestionDocente;
              promedios: CalificacionDocentePromedioResponse[];
            } => resultado.promedios !== null && resultado.promedios.length > 0)
            .map(({ gestion, promedios }) => ({
              gestion,
              claridad: this.promedioDeDocentes(promedios, 'claridadExplicacionesPromedio'),
              metodologia: this.promedioDeDocentes(promedios, 'metodologiaPromedio'),
              relacion: this.promedioDeDocentes(promedios, 'relacionClasesEvaluacionesPromedio')
            }));

          this.cargandoHistorial = false;
          this.changeDetectorRef.detectChanges();
        },
        error: () => {
          this.errorHistorial = this.mensajes.HISTORY_ERROR;
          this.cargandoHistorial = false;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  private promedioDeDocentes(
    promedios: CalificacionDocentePromedioResponse[],
    metrica: 'claridadExplicacionesPromedio' | 'metodologiaPromedio' | 'relacionClasesEvaluacionesPromedio'
  ): number {
    return promedios.reduce((total, promedio) => total + promedio[metrica], 0) /
      promedios.length;
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

          this.mensajeExito =
            this.mensajes.DELETE_SUCCESS;

          this.changeDetectorRef.detectChanges();
        },

        error: () => {

          this.eliminandoCalificacion = false;

          this.errorEnvio =
            this.mensajes.DELETE_ERROR;

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
            this.mensajes.SUCCESS
          );
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.enviandoCalificacion = false;

          this.errorEnvio =
            error.status === 409
              ? this.mensajes.DUPLICATE_ERROR
              : this.mensajes.REGISTER_ERROR;

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
            this.mensajes.UPDATE_SUCCESS
          );
        },

        error: () => {

          this.enviandoCalificacion = false;

          this.errorEnvio =
            this.mensajes.UPDATE_ERROR;

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
    mensaje: string
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
