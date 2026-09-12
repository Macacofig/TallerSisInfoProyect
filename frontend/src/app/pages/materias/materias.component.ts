import { ChangeDetectorRef, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout } from 'rxjs';
import { Materia } from '../../models/materia';
import { ApiService } from '../../services/api';
import { APP_CONFIG } from '../../strings/app-config';
import { DEMO_MATERIAS } from '../../strings/demo-data';
import { MESSAGES } from '../../strings/messages';

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
  readonly materias = signal<Materia[]>([]);
  readonly mostrandoDemo = signal(false);
  readonly estado = signal<'cargando' | 'listo' | 'error'>(APP_CONFIG.COMPONENT_STATES.LOADING);
  readonly materiaSeleccionada = signal<Materia | null>(null);

  constructor(private apiService: ApiService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarMaterias();
  }

  cargarMaterias(): void {
    this.estado.set(APP_CONFIG.COMPONENT_STATES.LOADING);
    this.materias.set([]);
    this.mostrandoDemo.set(false);
    this.apiService.obtenerMaterias()
      .pipe(timeout(APP_CONFIG.TIMEOUTS.API_REQUEST), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: materias => {
          const usarDemo = APP_CONFIG.DEMO_MODE && materias.length === 0;
          this.mostrandoDemo.set(usarDemo);
          this.materias.set(usarDemo ? DEMO_MATERIAS : materias);
          this.estado.set(APP_CONFIG.COMPONENT_STATES.READY);
        },
        error: () => {
          if (APP_CONFIG.DEMO_MODE) {
            this.mostrandoDemo.set(true);
            this.materias.set(DEMO_MATERIAS);
            this.estado.set(APP_CONFIG.COMPONENT_STATES.READY);
          } else {
            this.estado.set(APP_CONFIG.COMPONENT_STATES.ERROR);
          }
        }
      });
  }

  explorarMateria(materia: Materia): void {
    this.materiaSeleccionada.set(materia);
    this.changeDetector.detectChanges();
    this.detalle.nativeElement.showModal();
  }

  cerrarDetalle(): void {
    this.detalle.nativeElement.close();
  }

  limpiarSeleccion(): void {
    this.materiaSeleccionada.set(null);
  }

  getAnchoIndicador(valor?: number): string {
    if (!valor) return '0%';
    return `${(valor / APP_CONFIG.SCALE.RATING_TOTAL) * 100}%`;
  }
}
