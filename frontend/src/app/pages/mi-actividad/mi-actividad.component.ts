import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActividadEstudiante } from '../../models/actividad-estudiante.model';
import { ActividadEstudianteService } from '../../services/actividad-estudiante.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { ACTIVIDAD_MESSAGES } from '../../strings/actividad/actividad.messages';
import { ACTIVIDAD_MESSAGES_EN } from '../../strings/actividad/actividad-ingles.messages';
import { formatearFechaActividad } from './fecha-actividad';

type EstadoVista = 'cargando' | 'listo' | 'error' | 'sesion';
interface ResultadoActividad {
  clave: string;
  estado: EstadoVista;
  actividades: ActividadEstudiante[];
}

@Component({
  selector: 'app-mi-actividad',
  templateUrl: './mi-actividad.component.html',
  styleUrl: './mi-actividad.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiActividadComponent {
  private readonly actividadService = inject(ActividadEstudianteService);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  readonly usuario = this.auth.obtenerUsuarioSignal();
  private readonly claveSesion = computed(() => {
    const usuario = this.usuario();
    return usuario ? `${usuario.id}:${usuario.accessToken ?? ''}` : '';
  });
  private readonly reintentos = signal(0);
  private readonly resultado = signal<ResultadoActividad>({ clave: '', estado: 'sesion', actividades: [] });

  // Oculta el resultado anterior inmediatamente, incluso antes de ejecutar el efecto de la nueva sesión.
  readonly vista = computed<ResultadoActividad>(() => {
    const clave = this.claveSesion();
    return this.resultado().clave === clave
      ? this.resultado()
      : { clave, estado: clave ? 'cargando' : 'sesion', actividades: [] };
  });

  get mensajes() {
    return this.language.getMessages(ACTIVIDAD_MESSAGES, ACTIVIDAD_MESSAGES_EN);
  }

  constructor() {
    effect(onCleanup => {
      const clave = this.claveSesion();
      this.reintentos();
      untracked(() => {
        this.resultado.set({ clave, estado: 'cargando', actividades: [] });
        if (!this.auth.tieneSesionValida()) {
          this.resultado.set({ clave, estado: 'sesion', actividades: [] });
          return;
        }

        const consulta = this.actividadService.obtenerMiActividad().subscribe({
          next: actividades => {
            if (this.claveSesion() === clave) {
              this.resultado.set({ clave, estado: 'listo', actividades });
            }
          },
          error: () => {
            if (this.claveSesion() === clave) {
              this.resultado.set({ clave, estado: 'error', actividades: [] });
            }
          }
        });
        onCleanup(() => consulta.unsubscribe());
      });
    });
  }

  reintentar(): void {
    this.reintentos.update(valor => valor + 1);
  }

  formatearFecha(fecha: string): string | null {
    return formatearFechaActividad(fecha, this.language.currentLanguage());
  }
}
