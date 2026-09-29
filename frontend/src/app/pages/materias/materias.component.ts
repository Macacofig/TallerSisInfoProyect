import { ChangeDetectorRef, Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { of, Subscription, switchMap, timeout, timer } from 'rxjs';
import { Materia } from '../../models/materia';
import { ApiService } from '../../services/api';
import { APP_CONFIG } from '../../config/app-config';
import { MESSAGES } from '../../strings/materias/materias.messages';
import { NombreMateriaPipe } from '../../pipes/nombre-materia.pipe';
import { contieneTexto, normalizarTexto } from '../../utils/text.utils';
import { CalificacionMateriaPromedioMateriaResponse } from '../../models/calificacion-materia.model';
import { DecimalPipe } from '@angular/common';
import { DEMO_MATERIAS } from '../../data/demo-materias';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [NombreMateriaPipe , DecimalPipe],
  templateUrl: './materias.component.html',
  styleUrl: './materias.component.scss'
})
export class MateriasComponent implements OnInit {
  @ViewChild('detalle') private detalle!: ElementRef<HTMLDialogElement>;

  readonly MESSAGES = MESSAGES;
  readonly APP_CONFIG = APP_CONFIG;

  private readonly destroyRef = inject(DestroyRef);
  private consulta?: Subscription;
  private botonInformacion?: HTMLButtonElement;

  readonly materias = signal<Materia[]>([]);
  readonly promediosMaterias = signal<CalificacionMateriaPromedioMateriaResponse[]>([]);
  readonly mostrarDatosDemo = signal(false);
  readonly busqueda = signal('');
  readonly carreraSeleccionada = signal('');
  readonly carreras = signal<string[]>([]);
  readonly semestreSeleccionado = signal('');
  readonly semestres = signal<number[]>([]);
  readonly estadoCarreras = signal<'cargando' | 'listo' | 'error'>(
    APP_CONFIG.COMPONENT_STATES.LOADING
  );
  readonly estado = signal<'cargando' | 'listo' | 'error'>(
    APP_CONFIG.COMPONENT_STATES.LOADING
  );
  readonly materiaSeleccionada = signal<Materia | null>(null);
  readonly paginaActual = signal(1);
  readonly cantidadPorPagina = APP_CONFIG.PAGINATION.PAGE_SIZE;

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.materias().length / this.cantidadPorPagina))
  );

  readonly materiasPaginadas = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.cantidadPorPagina;
    return this.materias().slice(inicio, inicio + this.cantidadPorPagina);
  });

  readonly numerosPagina = computed(() =>
    Array.from(
      { length: this.totalPaginas() },
      (_, indice) => indice + 1
    )
  );

  constructor(
    private apiService: ApiService,
    private changeDetector: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCarreras();
    this.cargarMaterias();
    this.cargarPromediosMaterias();
  }

  actualizarBusqueda(valor: string): void {
    const anterior = this.busqueda().trim();

    this.busqueda.set(valor);

    if (valor.trim() !== anterior) {
      this.paginaActual.set(1);
      this.cargarMaterias(true);
    }
  }

  actualizarCarrera(valor: string): void {
    if (valor === this.carreraSeleccionada()) return;

    this.carreraSeleccionada.set(valor);
    this.paginaActual.set(1);
    this.cargarMaterias();
  }

  actualizarSemestre(valor: string): void {
    if (valor === this.semestreSeleccionado()) return;

    this.semestreSeleccionado.set(valor);
    this.paginaActual.set(1);
    this.cargarMaterias();
  }

  cargarCarreras(): void {
    this.estadoCarreras.set(APP_CONFIG.COMPONENT_STATES.LOADING);

    this.apiService.obtenerCarreras()
      .pipe(
        timeout(APP_CONFIG.TIMEOUTS.API_REQUEST),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: carreras => {
          this.carreras.set(this.prepararCarreras(carreras));
          this.estadoCarreras.set(APP_CONFIG.COMPONENT_STATES.READY);
        },
        error: () => {
          this.carreras.set([]);
          this.estadoCarreras.set(APP_CONFIG.COMPONENT_STATES.ERROR);
        }
      });
  }

  cargarMaterias(esperar = false): void {
    this.consulta?.unsubscribe();

    const nombre = this.busqueda().trim();
    const carrera = this.carreraSeleccionada();

    this.estado.set(APP_CONFIG.COMPONENT_STATES.LOADING);
    this.mostrarDatosDemo.set(false);
    this.materias.set([]);

    this.consulta = (
      esperar && nombre
        ? timer(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE)
        : of(0)
    )
      .pipe(
        switchMap(() =>
          this.apiService.obtenerMaterias(nombre, carrera)
            .pipe(timeout(APP_CONFIG.TIMEOUTS.API_REQUEST))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: materias => {
          const usarDatosDemo = APP_CONFIG.DEMO_MODE &&
            materias.length === 0 &&
            !nombre &&
            !carrera &&
            !this.semestreSeleccionado();
          const catalogo = usarDatosDemo ? DEMO_MATERIAS : materias;

          this.mostrarDatosDemo.set(usarDatosDemo);
          this.prepararSemestres(catalogo);
          this.materias.set(
            this.filtrarMaterias(catalogo, nombre, carrera)
          );

          this.ajustarPaginaActual();
          this.estado.set(APP_CONFIG.COMPONENT_STATES.READY);
        },
        error: () => {
          this.estado.set(APP_CONFIG.COMPONENT_STATES.ERROR);
        }
      });
  }

  cargarPromediosMaterias(): void {
    this.apiService.obtenerPromediosMaterias()
      .pipe(
        timeout(APP_CONFIG.TIMEOUTS.API_REQUEST),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: promedios => {
          this.promediosMaterias.set(promedios);
        },
        error: () => {
          this.promediosMaterias.set([]);
        }
      });
  }

  getPromedioMateria(
    idMateria: number
  ): CalificacionMateriaPromedioMateriaResponse | undefined {
    return this.promediosMaterias().find(
      promedio => promedio.idMateria === idMateria
    );
  }

  cambiarPagina(pagina: number): void {
    if (
      pagina < 1 ||
      pagina > this.totalPaginas() ||
      pagina === this.paginaActual()
    ) {
      return;
    }

    this.paginaActual.set(pagina);
  }

  abrirInformacion(
    materia: Materia,
    origen: HTMLButtonElement
  ): void {
    this.botonInformacion = origen;
    this.materiaSeleccionada.set(materia);
    this.changeDetector.detectChanges();
    this.detalle.nativeElement.showModal();
  }

  explorarMateria(materia: Materia): void {
    void this.router.navigate(['/materias', materia.id]);
  }

  cerrarDetalle(): void {
    this.detalle.nativeElement.close();
  }

  limpiarSeleccion(): void {
    this.materiaSeleccionada.set(null);
    this.botonInformacion?.focus({ preventScroll: true });
    this.botonInformacion = undefined;
  }

  getAnchoIndicador(valor?: number): string {
    if (!valor) return '0%';

    return `${(valor / APP_CONFIG.SCALE.RATING_TOTAL) * 100}%`;
  }

  private filtrarMaterias(
    materias: Materia[],
    nombre: string,
    carrera: string
  ): Materia[] {
    const semestre = this.semestreSeleccionado();

    return materias.filter(materia =>
      (!nombre || contieneTexto(materia.nombre, nombre)) &&
      (!carrera ||
        normalizarTexto(materia.carrera) === normalizarTexto(carrera)) &&
      (!semestre || materia.semestre === Number(semestre))
    );
  }



  private prepararSemestres(materias: Materia[]): void {
    const disponibles = [...new Set(
      materias
        .map(materia => materia.semestre)
        .filter(semestre => semestre != null)
    )];

    this.semestres.set(
      disponibles.sort((primero, segundo) => primero - segundo)
    );
  }

  private prepararCarreras(carreras: string[]): string[] {
    const unicas = new Map<string, string>();

    for (const carrera of carreras) {
      const valor = carrera?.trim();
      const clave = normalizarTexto(valor);

      if (valor && clave && !unicas.has(clave)) {
        unicas.set(clave, valor);
      }
    }

    return [...unicas.values()].sort((primera, segunda) =>
      primera.localeCompare(segunda, 'es', { sensitivity: 'base' })
    );
  }

  private ajustarPaginaActual(): void {
    if (this.paginaActual() > this.totalPaginas()) {
      this.paginaActual.set(this.totalPaginas());
    }
  }
}