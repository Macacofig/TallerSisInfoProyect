import { ChangeDetectorRef, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { of, Subscription, switchMap, timeout, timer } from 'rxjs';
import { Materia } from '../../models/materia';
import { ApiService } from '../../services/api';
import { APP_CONFIG } from '../../config/app-config';
import { DEMO_MATERIAS } from '../../data/demo-materias';
import { MESSAGES } from '../../strings/materias/materias.messages';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [],
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
  readonly carreras = APP_CONFIG.CARRERAS;
  readonly mostrandoDemo = signal(false);
  readonly estado = signal<'cargando' | 'listo' | 'error'>(APP_CONFIG.COMPONENT_STATES.LOADING);
  readonly materiaSeleccionada = signal<Materia | null>(null);

  constructor(
    private apiService: ApiService,
    private changeDetector: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMaterias();
  }

  actualizarBusqueda(valor: string): void {
    const anterior = this.busqueda().trim();
    this.busqueda.set(valor);
    if (valor.trim() !== anterior) this.cargarMaterias(true);
  }

  actualizarCarrera(valor: string): void {
    if (valor === this.carreraSeleccionada()) return;
    this.carreraSeleccionada.set(valor);
    this.cargarMaterias();
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
          this.mostrandoDemo.set(usarDemo);
          this.materias.set(usarDemo ? DEMO_MATERIAS : materias);
          this.estado.set(APP_CONFIG.COMPONENT_STATES.READY);
        },
        error: () => {
          if (APP_CONFIG.DEMO_MODE && sinFiltros) {
            this.mostrandoDemo.set(true);
            this.materias.set(DEMO_MATERIAS);
            this.estado.set(APP_CONFIG.COMPONENT_STATES.READY);
          } else {
            this.estado.set(APP_CONFIG.COMPONENT_STATES.ERROR);
          }
        }
      });
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
}
