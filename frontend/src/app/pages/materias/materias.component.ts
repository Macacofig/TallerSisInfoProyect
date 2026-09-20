import { ChangeDetectorRef, Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { of, Subscription, switchMap, timeout, timer } from 'rxjs';
import { Materia } from '../../models/materia';
import { ApiService } from '../../services/api';
import { APP_CONFIG } from '../../config/app-config';
import { DEMO_MATERIAS } from '../../data/demo-materias';
import { MESSAGES } from '../../strings/materias/materias.messages';
import { NombreMateriaPipe } from '../../pipes/nombre-materia.pipe';
import { contieneTexto, normalizarTexto } from '../../utils/text.utils';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [NombreMateriaPipe],
  templateUrl: './materias.component.html',
  styleUrl: './materias.component.scss'
})
export class MateriasComponent implements OnInit {
  @ViewChild('detalle') private detalle!: ElementRef<HTMLDialogElement>;

  // Constantes disponibles en el template
  readonly MESSAGES = MESSAGES;
  readonly APP_CONFIG = APP_CONFIG;

  private readonly destroyRef = inject(DestroyRef);
  private consulta?: Subscription;
  private botonInformacion?: HTMLButtonElement;
  readonly materias = signal<Materia[]>([]);
  readonly busqueda = signal('');
  readonly carreraSeleccionada = signal('');
  readonly carreras = signal<string[]>([]);
  readonly estadoCarreras = signal<'cargando' | 'listo' | 'error'>(APP_CONFIG.COMPONENT_STATES.LOADING);
  readonly mostrandoDemo = signal(false);
  readonly estado = signal<'cargando' | 'listo' | 'error'>(APP_CONFIG.COMPONENT_STATES.LOADING);
  readonly materiaSeleccionada = signal<Materia | null>(null);
  readonly paginaActual = signal(1);
  readonly cantidadPorPagina = APP_CONFIG.PAGINATION.PAGE_SIZE;
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.materias().length / this.cantidadPorPagina)));
  readonly materiasPaginadas = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.cantidadPorPagina;
    return this.materias().slice(inicio, inicio + this.cantidadPorPagina);
  });
  readonly numerosPagina = computed(() => Array.from({ length: this.totalPaginas() }, (_, indice) => indice + 1));

  constructor(
    private apiService: ApiService,
    private changeDetector: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCarreras();
    this.cargarMaterias();
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

  cargarCarreras(): void {
    this.estadoCarreras.set(APP_CONFIG.COMPONENT_STATES.LOADING);
    this.apiService.obtenerCarreras()
      .pipe(
        timeout(APP_CONFIG.TIMEOUTS.API_REQUEST),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: carreras => {
          const disponibles = this.prepararCarreras(carreras);
          this.carreras.set(disponibles.length || !APP_CONFIG.DEMO_MODE
            ? disponibles
            : this.prepararCarreras(DEMO_MATERIAS.map(materia => materia.carrera)));
          this.estadoCarreras.set(APP_CONFIG.COMPONENT_STATES.READY);
        },
        error: () => {
          this.carreras.set(APP_CONFIG.DEMO_MODE ? this.prepararCarreras(DEMO_MATERIAS.map(materia => materia.carrera)) : []);
          this.estadoCarreras.set(APP_CONFIG.COMPONENT_STATES.ERROR);
        }
      });
  }

  cargarMaterias(esperar = false): void {
    // Cancela tanto la espera como la petición anterior para evitar resultados obsoletos.
    this.consulta?.unsubscribe();
    const nombre = this.busqueda().trim();
    const carrera = this.carreraSeleccionada();
    const sinFiltros = !nombre && !carrera;
    this.estado.set(APP_CONFIG.COMPONENT_STATES.LOADING);
    this.materias.set([]);
    this.mostrandoDemo.set(false);
    this.consulta = (esperar && nombre ? timer(APP_CONFIG.TIMEOUTS.SEARCH_DEBOUNCE) : of(0))
      .pipe(
        switchMap(() => this.apiService.obtenerMaterias(nombre, carrera).pipe(timeout(APP_CONFIG.TIMEOUTS.API_REQUEST))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: materias => {
          const usarDemo = APP_CONFIG.DEMO_MODE && sinFiltros && materias.length === 0;
          const resultados = usarDemo ? DEMO_MATERIAS : materias;
          this.mostrandoDemo.set(usarDemo);
          this.materias.set(this.filtrarMaterias(resultados, nombre, carrera));
          this.ajustarPaginaActual();
          this.estado.set(APP_CONFIG.COMPONENT_STATES.READY);
        },
        error: () => {
          if (APP_CONFIG.DEMO_MODE && sinFiltros) {
            this.mostrandoDemo.set(true);
            this.materias.set(this.filtrarMaterias(DEMO_MATERIAS, nombre, carrera));
            this.ajustarPaginaActual();
            this.estado.set(APP_CONFIG.COMPONENT_STATES.READY);
          } else {
            this.estado.set(APP_CONFIG.COMPONENT_STATES.ERROR);
          }
        }
      });
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas() || pagina === this.paginaActual()) return;
    this.paginaActual.set(pagina);
  }

  abrirInformacion(materia: Materia, origen: HTMLButtonElement): void {
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

  private filtrarMaterias(materias: Materia[], nombre: string, carrera: string): Materia[] {
    return materias.filter(materia =>
      (!nombre || contieneTexto(materia.nombre, nombre)) &&
      (!carrera || normalizarTexto(materia.carrera) === normalizarTexto(carrera))
    );
  }

  private prepararCarreras(carreras: string[]): string[] {
    const unicas = new Map<string, string>();
    for (const carrera of carreras) {
      const valor = carrera?.trim();
      const clave = normalizarTexto(valor);
      if (valor && clave && !unicas.has(clave)) unicas.set(clave, valor);
    }
    return [...unicas.values()].sort((primera, segunda) =>
      primera.localeCompare(segunda, 'es', { sensitivity: 'base' }));
  }

  private ajustarPaginaActual(): void {
    if (this.paginaActual() > this.totalPaginas()) this.paginaActual.set(this.totalPaginas());
  }
}
