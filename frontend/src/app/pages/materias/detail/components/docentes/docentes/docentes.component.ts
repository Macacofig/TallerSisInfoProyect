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
} from '../../../../../../models/materia';

import {
  Docente
} from '../../../../../../models/docente.model';

import {
  CalificacionDocentePromedioResponse,
  CalificacionDocenteResponse,
  GestionDocente,
  RegistrarCalificacionDocenteRequest
} from '../../../../../../models/calificacion-docente.model';

import {
  DocentesService
} from '../../../../../../services/docentes.service';

import {
  CalificacionesDocenteService
} from '../../../../../../services/calificaciones-docente.service';

import {
  APP_CONFIG
} from '../../../../../../config/app-config';

import {
  DOCENTES_MESSAGES
} from '../../../../../../strings/materias/docentes.messages';

interface DocenteConCalificacion {
  docente: Docente;
  calificacion: CalificacionDocenteResponse | null;
  promedio: CalificacionDocentePromedioResponse | null;
  estadoCalificacionDisponible: boolean;
}

interface ResultadoCargaDocentes {
  items: DocenteConCalificacion[];
  estadoCalificacionesIncompleto: boolean;
  errorPromedios: boolean;
}

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './docentes.component.html',
  styleUrl: './docentes.component.scss'
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
  errorEnvio = '';
  mensajeExito = '';

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
    this.cargando = true;
    this.cargandoPromedios = false;
    this.error = '';
    this.advertenciaEstado = '';
    this.errorPromedios = '';
    this.docentes = [];

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

    return this.calificacionSeleccionada?.gestion ===
      'año-I'
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

    return this.periodoActual === 'I'
      ? 'año-I'
      : 'año-II';
  }

}
