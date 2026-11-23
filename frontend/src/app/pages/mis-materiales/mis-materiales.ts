import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialEstudiante, EstadoRevisionMaterial } from '../../models/material-estudiante.model';
import { AuthService } from '../../services/auth.service';
import { MaterialEstudianteService } from '../../services/material-estudiante.service';
import { LanguageService } from '../../services/language.service';
import { MIS_MATERIALES_MESSAGES } from '../../strings/mis-materiales/mis-materiales.messages';
import { MIS_MATERIALES_MESSAGES_EN } from '../../strings/mis-materiales/mis-materiales-ingles.messages';
import {
  estadoVisualMaterial,
  filtrarMateriales,
  FiltroEstadoMaterial
} from './mis-materiales.utils';

type EstadoVista = 'cargando' | 'listo' | 'error' | 'sesion';
interface ResultadoMateriales {
  clave: string;
  estado: EstadoVista;
  materiales: MaterialEstudiante[];
}

@Component({
  selector: 'app-mis-materiales',
  imports: [RouterLink],
  templateUrl: './mis-materiales.html',
  styleUrl: './mis-materiales.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisMateriales {
  private readonly materialesService = inject(MaterialEstudianteService);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  readonly usuario = this.auth.obtenerUsuarioSignal();
  readonly busquedaTitulo = signal('');
  readonly estadoSeleccionado = signal<FiltroEstadoMaterial>('TODOS');
  private readonly claveSesion = computed(() => {
    const usuario = this.usuario();
    return usuario ? `${usuario.id}:${usuario.accessToken ?? ''}` : '';
  });
  private readonly reintentos = signal(0);
  private readonly resultado = signal<ResultadoMateriales>({
    clave: '',
    estado: 'sesion',
    materiales: []
  });

  readonly vista = computed<ResultadoMateriales>(() => {
    const clave = this.claveSesion();
    return this.resultado().clave === clave
      ? this.resultado()
      : { clave, estado: clave ? 'cargando' : 'sesion', materiales: [] };
  });
  readonly materialesFiltrados = computed(() =>
    filtrarMateriales(this.vista().materiales, this.busquedaTitulo(), this.estadoSeleccionado())
  );

  get mensajes() {
    return this.language.getMessages(MIS_MATERIALES_MESSAGES, MIS_MATERIALES_MESSAGES_EN);
  }

  constructor() {
    effect(onCleanup => {
      const clave = this.claveSesion();
      this.reintentos();
      untracked(() => {
        this.resultado.set({ clave, estado: 'cargando', materiales: [] });
        if (!this.auth.tieneSesionValida()) {
          this.resultado.set({ clave, estado: 'sesion', materiales: [] });
          return;
        }

        const consulta = this.materialesService.obtenerMisMateriales().subscribe({
          next: materiales => {
            if (this.claveSesion() === clave) {
              this.resultado.set({ clave, estado: 'listo', materiales });
            }
          },
          error: error => {
            if (this.claveSesion() === clave) {
              this.resultado.set({
                clave,
                estado: 'error',
                materiales: []
              });
            }
          }
        });
        onCleanup(() => consulta.unsubscribe());
      });
    });
  }

  actualizarBusqueda(event: Event): void {
    this.busquedaTitulo.set((event.target as HTMLInputElement).value);
  }

  actualizarEstado(event: Event): void {
    const estado = (event.target as HTMLSelectElement).value;
    if (estado === 'TODOS' || estado === 'PENDIENTE' || estado === 'APROBADO' || estado === 'NEGADO') {
      this.estadoSeleccionado.set(estado);
    }
  }

  etiquetaTipo(tipo: NonNullable<MaterialEstudiante['tipo']>): string {
    return this.mensajes.TIPOS[tipo];
  }

  estadoVisual(estado: EstadoRevisionMaterial): string {
    return estadoVisualMaterial(estado);
  }

  reintentar(): void {
    this.reintentos.update(valor => valor + 1);
  }
}
