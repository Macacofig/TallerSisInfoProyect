import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute
} from '@angular/router';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Materia
} from '../../../models/materia';

import {
  CalificacionMateriaPromedioResponse,
  CalificacionMateriaResponse,
  PredominioMateria,
  RegistrarCalificacionMateriaRequest
} from '../../../models/calificacion-materia.model';

import {
  MateriasService
} from '../../../services/materias.service';

import {
  CalificacionesMateriaService
} from '../../../services/calificaciones-materia.service';

import { APP_CONFIG } from '../../../config/app-config';
import { MESSAGES } from '../../../strings/materias/materias.messages';
import { NombreMateriaPipe } from '../../../pipes/nombre-materia.pipe';

import {
  CalificacionGraficosComponent
} from './components/calificacion-graficos/calificacion-graficos/calificacion-graficos.component';

import {
  FiltroGestionesComponent,
  FiltroGestionesResultado
} from './components/filtro-gestiones/filtro-gestiones/filtro-gestiones.component';

import {
  HistorialCalificacionesComponent
} from './components/historial-calificaciones/historial-calificaciones/historial-calificaciones.component';

import {
  SeccionesDetalleComponent,
  SeccionDetalleMateria
} from './components/secciones-detalle/secciones-detalle/secciones-detalle.component';

import {
  DocentesComponent
} from './components/docentes/docentes/docentes.component';
@Component({
  selector: 'app-materia-detalle',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NombreMateriaPipe,
    CalificacionGraficosComponent,
    FiltroGestionesComponent,
    HistorialCalificacionesComponent,
    SeccionesDetalleComponent,
    DocentesComponent
  ],
  templateUrl: './materia-detalle.component.html',
  styleUrl: './materia-detalle.component.scss'
})
export class MateriaDetalleComponent implements OnInit {

  readonly mensajes = MESSAGES;
  seccionActiva: SeccionDetalleMateria = 'resumen';

  materia: Materia | null = null;

  calificacionExistente:
    CalificacionMateriaResponse | null = null;

  promediosMateria:
    CalificacionMateriaPromedioResponse | null = null;

  promediosMostrados:
    CalificacionMateriaPromedioResponse | null = null;

  gestiones: string[] = [];

  gestionActual: string | null = null;
  gestionAnterior: string | null = null;

  contextoPromedios: string =
    MESSAGES.CALIFICATION_SUMMARY_GENERAL_CONTEXT;

  filtroGestionesActivo =
    false;

  cargando = true;
  cargandoPromedios = false;
  cargandoGestiones = false;
  enviandoCalificacion = false;
  verificandoCalificacion = false;

  yaCalifico = false;

  error = '';
  errorCalificacion = '';
  errorEstadoCalificacion = '';
  errorPromedios = '';
  errorGestiones = '';

  mostrarFormularioCalificacion = false;
  mostrarConfirmacion = false;
  mostrarConfirmacionEliminacion = false;
  modoEdicion = false;
  eliminandoCalificacion = false;

  formularioCalificacion: FormGroup;

  private readonly idEstudianteActual =
    APP_CONFIG.DEMO.STUDENT_ID;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly materiasService: MateriasService,
    private readonly calificacionesMateriaService:
      CalificacionesMateriaService,
    private readonly formBuilder: FormBuilder,
    private readonly changeDetectorRef:
      ChangeDetectorRef
  ) {

    this.formularioCalificacion =
      this.formBuilder.group({

        dificultad: [
          5,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(10)
          ]
        ],

        carga: [
          5,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(10)
          ]
        ],

        conocimientoPrevio: [
          5,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(10)
          ]
        ],

        prerequisitos: [
          '',
          [
            Validators.required
          ]
        ],

        predominio: [
          'Practico',
          [
            Validators.required
          ]
        ],

        gestion: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\d+-(1|2)$/)
          ]
        ]

      });
  }

  ngOnInit(): void {

    const materiaId =
      this.obtenerMateriaId();

    if (!materiaId) {

      this.error =
        MESSAGES.CALIFICATION_INVALID_SUBJECT_ID;

      this.cargando =
        false;

      return;
    }

    this.cargarMateria(
      materiaId
    );
  }

  aplicarFiltroGestiones(
    resultado: FiltroGestionesResultado
  ): void {

    this.promediosMostrados =
      resultado.promedios;

    this.contextoPromedios =
      resultado.descripcion;

    this.filtroGestionesActivo =
      true;

    this.changeDetectorRef
      .markForCheck();
  }

  limpiarFiltroGestiones(): void {

    this.promediosMostrados =
      this.promediosMateria;

    this.contextoPromedios =
      MESSAGES.CALIFICATION_SUMMARY_GENERAL_CONTEXT;

    this.filtroGestionesActivo =
      false;

    this.changeDetectorRef
      .markForCheck();
  }

  seleccionarSeccion(
    seccion: SeccionDetalleMateria
  ): void {
    this.seccionActiva =
      seccion;
  }
  abrirFormularioCalificacion(): void {

    if (this.verificandoCalificacion) {
      return;
    }

    this.modoEdicion =
      false;

    this.mostrarFormularioCalificacion =
      true;

    this.mostrarConfirmacion =
      false;

    this.mostrarConfirmacionEliminacion =
      false;

    this.errorCalificacion =
      '';
  }

  abrirEdicionCalificacion(): void {

    if (
      !this.calificacionExistente ||
      this.enviandoCalificacion ||
      this.eliminandoCalificacion
    ) {
      return;
    }

    this.formularioCalificacion
      .patchValue({

        dificultad:
          this.calificacionExistente.dificultad,

        carga:
          this.calificacionExistente.carga,

        conocimientoPrevio:
          this.calificacionExistente.conocimientoPrevio,

        prerequisitos:
          this.calificacionExistente.prerequisitosText,

        predominio:
          this.calificacionExistente.predominio,

        gestion:
          this.calificacionExistente.gestion
      });

    this.modoEdicion =
      true;

    this.mostrarConfirmacion =
      false;

    this.mostrarConfirmacionEliminacion =
      false;

    this.errorCalificacion =
      '';

    this.changeDetectorRef
      .markForCheck();
  }

  cancelarEdicionCalificacion(): void {

    this.modoEdicion =
      false;

    this.mostrarConfirmacion =
      false;

    this.errorCalificacion =
      '';

    this.changeDetectorRef
      .markForCheck();
  }

  cerrarFormularioCalificacion(): void {

    if (
      this.enviandoCalificacion ||
      this.eliminandoCalificacion
    ) {
      return;
    }

    this.mostrarFormularioCalificacion =
      false;

    this.mostrarConfirmacion =
      false;

    this.mostrarConfirmacionEliminacion =
      false;

    this.modoEdicion =
      false;

    this.errorCalificacion =
      '';
  }

  abrirConfirmacion(): void {

    if (
      (
        this.yaCalifico &&
        !this.modoEdicion
      ) ||
      this.formularioCalificacion.invalid
    ) {

      this.formularioCalificacion
        .markAllAsTouched();

      return;
    }

    this.errorCalificacion =
      '';

    this.mostrarConfirmacion =
      true;
  }

  cancelarConfirmacion(): void {

    this.mostrarConfirmacion =
      false;
  }

  abrirConfirmacionEliminacion(): void {

    if (
      !this.calificacionExistente ||
      this.enviandoCalificacion ||
      this.eliminandoCalificacion
    ) {
      return;
    }

    this.errorCalificacion =
      '';

    this.mostrarConfirmacionEliminacion =
      true;

    this.changeDetectorRef
      .markForCheck();
  }

  cancelarConfirmacionEliminacion(): void {

    if (this.eliminandoCalificacion) {
      return;
    }

    this.mostrarConfirmacionEliminacion =
      false;

    this.changeDetectorRef
      .markForCheck();
  }

  normalizarGestion(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    let valor =
      input.value.replace(
        /[^0-9-]/g,
        ''
      );

    const tieneGuion =
      valor.includes('-');

    const partes =
      valor.split('-');

    const anio =
      partes[0];

    let semestre =
      partes
        .slice(1)
        .join('')
        .replace(
          /[^12]/g,
          ''
        );

    semestre =
      semestre.slice(
        0,
        1
      );

    const gestion =
      tieneGuion
        ? `${anio}-${semestre}`
        : anio;

    input.value =
      gestion;

    this.formularioCalificacion
      .get('gestion')
      ?.setValue(
        gestion,
        {
          emitEvent: false
        }
      );
  }

  confirmarCalificacion(): void {

    const materiaId =
      this.obtenerMateriaId();

    if (
      !materiaId ||
      this.formularioCalificacion.invalid ||
      this.enviandoCalificacion ||
      (
        this.yaCalifico &&
        !this.modoEdicion
      )
    ) {
      return;
    }

    const valores =
      this.formularioCalificacion
        .getRawValue();

    const prerequisitos =
      this.convertirPrerequisitos(
        valores.prerequisitos
      );

    if (
      prerequisitos.length === 0
    ) {

      this.errorCalificacion =
        MESSAGES.CALIFICATION_PREREQUISITES_REQUIRED;

      return;
    }

    const calificacion:
      RegistrarCalificacionMateriaRequest = {

        idMateria:
          materiaId,

        idEstudiante:
          this.idEstudianteActual,

        dificultad:
          Number(
            valores.dificultad
          ),

        carga:
          Number(
            valores.carga
          ),

        conocimientoPrevio:
          Number(
            valores.conocimientoPrevio
          ),

        prerequisitos,

        predominio:
          valores.predominio as PredominioMateria,

        gestion:
          valores.gestion
      };

    const esEdicion =
      this.modoEdicion;

    this.enviandoCalificacion =
      true;

    this.errorCalificacion =
      '';

    const operacion =
      esEdicion
        ? this.calificacionesMateriaService
            .actualizarCalificacion(
              this.idEstudianteActual,
              materiaId,
              calificacion
            )
        : this.calificacionesMateriaService
            .registrarCalificacion(
              calificacion
            );

    operacion
      .subscribe({

        next: (respuesta) => {

          this.enviandoCalificacion =
            false;

          this.mostrarConfirmacion =
            false;

          this.mostrarConfirmacionEliminacion =
            false;

          this.yaCalifico =
            true;

          this.calificacionExistente =
            respuesta;

          this.modoEdicion =
            false;

          this.mostrarFormularioCalificacion =
            esEdicion;

          this.filtroGestionesActivo =
            false;

          this.contextoPromedios =
            MESSAGES.CALIFICATION_SUMMARY_GENERAL_CONTEXT;

          this.cargarPromediosMateria(
            materiaId
          );

          this.cargarGestiones();

          this.changeDetectorRef
            .markForCheck();
        },

        error: (error) => {

          this.enviandoCalificacion =
            false;

          if (
            error.status === 400
          ) {

            this.errorCalificacion =
              MESSAGES.CALIFICATION_INVALID_DATA;

          } else if (
            error.status === 404
          ) {

            this.errorCalificacion =
              MESSAGES.CALIFICATION_SUBJECT_UNAVAILABLE;

          } else {

            this.errorCalificacion =
              esEdicion
                ? MESSAGES.CALIFICATION_UPDATE_ERROR
                : MESSAGES.CALIFICATION_REGISTER_ERROR;
          }

          this.changeDetectorRef
            .markForCheck();
        }

      });
  }

  confirmarEliminacionCalificacion(): void {

    const materiaId =
      this.obtenerMateriaId();

    if (
      !materiaId ||
      !this.calificacionExistente ||
      this.enviandoCalificacion ||
      this.eliminandoCalificacion
    ) {
      return;
    }

    this.eliminandoCalificacion =
      true;

    this.errorCalificacion =
      '';

    this.calificacionesMateriaService
      .eliminarCalificacion(
        this.idEstudianteActual,
        materiaId
      )
      .subscribe({

        next: () => {

          this.eliminandoCalificacion =
            false;

          this.mostrarConfirmacionEliminacion =
            false;

          this.mostrarConfirmacion =
            false;

          this.mostrarFormularioCalificacion =
            false;

          this.modoEdicion =
            false;

          this.yaCalifico =
            false;

          this.calificacionExistente =
            null;

          this.filtroGestionesActivo =
            false;

          this.contextoPromedios =
            MESSAGES.CALIFICATION_SUMMARY_GENERAL_CONTEXT;

          this.cargarPromediosMateria(
            materiaId
          );

          this.cargarGestiones();

          this.changeDetectorRef
            .markForCheck();
        },

        error: (error) => {

          this.eliminandoCalificacion =
            false;

          if (
            error.status === 404
          ) {

            this.errorCalificacion =
              MESSAGES.CALIFICATION_DELETE_NOT_FOUND;

          } else {

            this.errorCalificacion =
              MESSAGES.CALIFICATION_DELETE_ERROR;
          }

          this.changeDetectorRef
            .markForCheck();
        }

      });
  }

  obtenerPrerequisitosParaMostrar(): string {

    const valor =
      this.formularioCalificacion
        .get('prerequisitos')
        ?.value;

    return this.convertirPrerequisitos(
      valor
    ).join(', ');
  }

  obtenerPredominioParaMostrar(
    predominio: PredominioMateria
  ): string {

    return predominio === 'Practico'
      ? MESSAGES.CALIFICATION_PRACTICAL_LABEL
      : MESSAGES.CALIFICATION_THEORETICAL_LABEL;
  }

  obtenerPromedioFormateado(
    promedio: number
  ): string {

    return promedio.toFixed(1);
  }

  private convertirPrerequisitos(
    valor: string
  ): string[] {

    if (!valor) {
      return [];
    }

    return valor
      .split(',')
      .map(
        (prerequisito) =>
          prerequisito.trim()
      )
      .filter(
        (prerequisito) =>
          prerequisito.length > 0
      );
  }

  private obtenerMateriaId():
    number | null {

    const materiaId =
      Number(
        this.route
          .snapshot
          .paramMap
          .get('materiaId')
      );

    return materiaId > 0
      ? materiaId
      : null;
  }

  private cargarMateria(
    materiaId: number
  ): void {

    this.materiasService
      .obtenerMateriaPorId(
        materiaId
      )
      .subscribe({

        next: (materia) => {

          if (!materia) {

            this.error =
              MESSAGES.CALIFICATION_SUBJECT_NOT_FOUND;

            this.cargando =
              false;

            this.changeDetectorRef
              .markForCheck();

            return;
          }

          this.materia =
            materia;

          this.cargando =
            false;

          this.verificarCalificacionExistente(
            materiaId
          );

          this.cargarPromediosMateria(
            materiaId
          );

          this.cargarGestiones();

          this.changeDetectorRef
            .markForCheck();
        },

        error: () => {

          this.error =
            MESSAGES.CALIFICATION_SUBJECT_LOAD_ERROR;

          this.cargando =
            false;

          this.changeDetectorRef
            .markForCheck();
        }

      });
  }

  private verificarCalificacionExistente(
    materiaId: number
  ): void {

    this.verificandoCalificacion =
      true;

    this.errorEstadoCalificacion =
      '';

    this.calificacionesMateriaService
      .obtenerCalificacionPorEstudiante(
        this.idEstudianteActual,
        materiaId
      )
      .subscribe({

        next: (calificacion) => {

          this.calificacionExistente =
            calificacion;

          this.yaCalifico =
            calificacion !== null;

          this.verificandoCalificacion =
            false;

          this.changeDetectorRef
            .markForCheck();
        },

        error: () => {

          this.verificandoCalificacion =
            false;

          /*
           * Ante un error de verificación no se permite
           * registrar una nueva calificación para evitar
           * posibles duplicados.
           */
          this.yaCalifico =
            true;

          this.calificacionExistente =
            null;

          this.errorEstadoCalificacion =
            MESSAGES.CALIFICATION_STATUS_ERROR;

          this.changeDetectorRef
            .markForCheck();
        }

      });
  }

  private cargarPromediosMateria(
    materiaId: number
  ): void {

    this.cargandoPromedios =
      true;

    this.errorPromedios =
      '';

    this.calificacionesMateriaService
      .obtenerPromediosPorMateria(
        materiaId
      )
      .subscribe({

        next: (promedios) => {

          this.promediosMateria =
            promedios;

          if (
            !this.filtroGestionesActivo
          ) {

            this.promediosMostrados =
              promedios;
          }

          this.cargandoPromedios =
            false;

          this.changeDetectorRef
            .markForCheck();
        },

        error: (error) => {

          this.cargandoPromedios =
            false;

          if (
            error.status === 404
          ) {

            this.promediosMateria =
              null;

            if (
              !this.filtroGestionesActivo
            ) {

              this.promediosMostrados =
                null;
            }

          } else {

            this.errorPromedios =
              MESSAGES.CALIFICATION_SUMMARY_LOAD_ERROR;
          }

          this.changeDetectorRef
            .markForCheck();
        }

      });
  }

  private cargarGestiones(): void {

    this.cargandoGestiones =
      true;

    this.errorGestiones =
      '';

    this.calificacionesMateriaService
      .obtenerGestiones()
      .subscribe({

        next: (gestiones) => {

          this.gestiones =
            [...gestiones].sort(
              (
                a,
                b
              ) =>
                this.compararGestiones(
                  a,
                  b
                )
            );

          this.actualizarGestionesReferencia();

          this.cargandoGestiones =
            false;

          this.changeDetectorRef
            .markForCheck();
        },

        error: () => {

          this.cargandoGestiones =
            false;

          this.gestiones =
            [];

          this.gestionActual =
            null;

          this.gestionAnterior =
            null;

          this.errorGestiones =
            MESSAGES.CALIFICATION_MANAGEMENTS_LOAD_ERROR;

          this.changeDetectorRef
            .markForCheck();
        }

      });
  }

  private actualizarGestionesReferencia(): void {

    if (
      this.gestiones.length === 0
    ) {

      this.gestionActual =
        null;

      this.gestionAnterior =
        null;

      return;
    }

    this.gestionActual =
      this.gestiones[
        this.gestiones.length - 1
      ];

    this.gestionAnterior =
      this.gestiones.length > 1
        ? this.gestiones[
            this.gestiones.length - 2
          ]
        : null;
  }

  private compararGestiones(
    primeraGestion: string,
    segundaGestion: string
  ): number {

    const [
      anioPrimera,
      periodoPrimera
    ] =
      primeraGestion
        .split('-')
        .map(Number);

    const [
      anioSegunda,
      periodoSegunda
    ] =
      segundaGestion
        .split('-')
        .map(Number);

    if (
      anioPrimera !== anioSegunda
    ) {

      return (
        anioPrimera -
        anioSegunda
      );
    }

    return (
      periodoPrimera -
      periodoSegunda
    );
  }
}
