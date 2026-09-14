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

import {
  APP_CONFIG,
  MESSAGES
} from '../../../strings';

@Component({
  selector: 'app-materia-detalle',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './materia-detalle.component.html',
  styleUrl: './materia-detalle.component.scss'
})
export class MateriaDetalleComponent implements OnInit {

  readonly mensajes = MESSAGES;

  materia: Materia | null = null;

  calificacionExistente:
    CalificacionMateriaResponse | null = null;

  cargando = true;
  enviandoCalificacion = false;
  verificandoCalificacion = false;

  yaCalifico = false;

  error = '';
  errorCalificacion = '';
  errorEstadoCalificacion = '';

  mostrarFormularioCalificacion = false;
  mostrarConfirmacion = false;

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

      this.cargando = false;

      return;
    }

    this.cargarMateria(
      materiaId
    );
  }

  abrirFormularioCalificacion(): void {

    if (this.verificandoCalificacion) {
      return;
    }

    this.mostrarFormularioCalificacion =
      true;

    this.mostrarConfirmacion =
      false;

    this.errorCalificacion =
      '';
  }

  cerrarFormularioCalificacion(): void {

    this.mostrarFormularioCalificacion =
      false;

    this.mostrarConfirmacion =
      false;

    this.errorCalificacion =
      '';
  }

  abrirConfirmacion(): void {

    if (
      this.yaCalifico ||
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
      this.yaCalifico
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

    this.enviandoCalificacion =
      true;

    this.errorCalificacion =
      '';

    this.calificacionesMateriaService
      .registrarCalificacion(
        calificacion
      )
      .subscribe({

        next: (respuesta) => {

          this.enviandoCalificacion =
            false;

          this.mostrarConfirmacion =
            false;

          this.mostrarFormularioCalificacion =
            false;

          this.yaCalifico =
            true;

          this.calificacionExistente =
            respuesta;

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
              MESSAGES.CALIFICATION_REGISTER_ERROR;
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
}