import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Materia } from '../../../models/materia';

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

import {
  APP_CONFIG
} from '../../../strings/app-config';

import {
  CalificacionGraficosComponent
} from './calificacion-graficos/calificacion-graficos.component';

@Component({
  selector: 'app-materia-detalle',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CalificacionGraficosComponent
  ],
  templateUrl: './materia-detalle.component.html',
  styleUrl: './materia-detalle.component.scss'
})
export class MateriaDetalleComponent implements OnInit {

  materia: Materia | null = null;

  calificacionExistente:
    CalificacionMateriaResponse | null = null;

  promediosMateria:
    CalificacionMateriaPromedioResponse | null = null;

  gestiones: string[] = [];

  gestionActual: string | null = null;
  gestionAnterior: string | null = null;

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

  formularioCalificacion: FormGroup;

  private readonly idEstudianteActual =
    APP_CONFIG.DEMO.STUDENT_ID;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly materiasService: MateriasService,
    private readonly calificacionesMateriaService:
      CalificacionesMateriaService,
    private readonly formBuilder: FormBuilder,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {

    this.formularioCalificacion = this.formBuilder.group({

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

    const materiaId = this.obtenerMateriaId();

    if (!materiaId) {

      this.error =
        'El identificador de la materia no es válido.';

      this.cargando = false;

      return;
    }

    this.cargarMateria(materiaId);
  }

  abrirFormularioCalificacion(): void {

    if (this.verificandoCalificacion) {
      return;
    }

    this.mostrarFormularioCalificacion = true;
    this.mostrarConfirmacion = false;
    this.errorCalificacion = '';
  }

  cerrarFormularioCalificacion(): void {

    this.mostrarFormularioCalificacion = false;
    this.mostrarConfirmacion = false;
    this.errorCalificacion = '';
  }

  abrirConfirmacion(): void {

    if (
      this.yaCalifico ||
      this.formularioCalificacion.invalid
    ) {

      this.formularioCalificacion.markAllAsTouched();
      return;
    }

    this.errorCalificacion = '';
    this.mostrarConfirmacion = true;
  }

  cancelarConfirmacion(): void {
    this.mostrarConfirmacion = false;
  }

  normalizarGestion(event: Event): void {

    const input = event.target as HTMLInputElement;

    let valor =
      input.value.replace(/[^0-9-]/g, '');

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
        .replace(/[^12]/g, '');

    semestre =
      semestre.slice(0, 1);

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
      this.formularioCalificacion.getRawValue();

    const prerequisitos =
      this.convertirPrerequisitos(
        valores.prerequisitos
      );

    if (prerequisitos.length === 0) {

      this.errorCalificacion =
        'Debes ingresar al menos un prerequisito.';

      return;
    }

    const calificacion:
      RegistrarCalificacionMateriaRequest = {

        idMateria:
          materiaId,

        idEstudiante:
          this.idEstudianteActual,

        dificultad:
          Number(valores.dificultad),

        carga:
          Number(valores.carga),

        conocimientoPrevio:
          Number(valores.conocimientoPrevio),

        prerequisitos,

        predominio:
          valores.predominio as PredominioMateria,

        gestion:
          valores.gestion
      };

    this.enviandoCalificacion = true;
    this.errorCalificacion = '';

    this.calificacionesMateriaService
      .registrarCalificacion(
        calificacion
      )
      .subscribe({

        next: (respuesta) => {

          this.enviandoCalificacion = false;

          this.mostrarConfirmacion = false;
          this.mostrarFormularioCalificacion = false;

          this.yaCalifico = true;
          this.calificacionExistente = respuesta;

          this.cargarPromediosMateria(
            materiaId
          );

          this.cargarGestiones();

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          this.enviandoCalificacion = false;

          if (error.status === 400) {

            this.errorCalificacion =
              'Los datos de la calificación no son válidos.';

          } else if (error.status === 404) {

            this.errorCalificacion =
              'La materia solicitada no está disponible.';

          } else {

            this.errorCalificacion =
              'No se pudo registrar la calificación. Intenta nuevamente.';
          }

          this.changeDetectorRef.markForCheck();
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
      ? 'Práctico'
      : 'Teórico';
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

  private obtenerMateriaId(): number | null {

    const materiaId =
      Number(
        this.route.snapshot.paramMap.get(
          'materiaId'
        )
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
              'La materia solicitada no existe.';

            this.cargando = false;

            this.changeDetectorRef.markForCheck();

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

          this.changeDetectorRef.markForCheck();
        },

        error: () => {

          this.error =
            'No se pudo cargar la información de la materia.';

          this.cargando =
            false;

          this.changeDetectorRef.markForCheck();
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

          this.changeDetectorRef.markForCheck();
        },

        error: () => {

          this.verificandoCalificacion =
            false;

          this.yaCalifico =
            true;

          this.calificacionExistente =
            null;

          this.errorEstadoCalificacion =
            'No se pudo verificar si ya calificaste esta materia.';

          this.changeDetectorRef.markForCheck();
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

          this.cargandoPromedios =
            false;

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          this.cargandoPromedios =
            false;

          if (error.status === 404) {

            this.promediosMateria =
              null;

          } else {

            this.errorPromedios =
              'No se pudieron cargar los datos de calificación de la materia.';
          }

          this.changeDetectorRef.markForCheck();
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
              (a, b) =>
                this.compararGestiones(
                  a,
                  b
                )
            );

          this.actualizarGestionesReferencia();

          this.cargandoGestiones =
            false;

          this.changeDetectorRef.markForCheck();
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
            'No se pudieron cargar las gestiones disponibles.';

          this.changeDetectorRef.markForCheck();
        }

      });
  }

  private actualizarGestionesReferencia(): void {

    if (this.gestiones.length === 0) {

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

    if (anioPrimera !== anioSegunda) {

      return anioPrimera - anioSegunda;
    }

    return periodoPrimera - periodoSegunda;
  }
}