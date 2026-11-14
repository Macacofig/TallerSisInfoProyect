import {
  Component,
  computed,
  inject,
  input,
  signal
} from '@angular/core';

import { LanguageService } from '../../../../../services/language.service';
import { MESSAGES } from '../../../../../strings/materias/materias.messages';
import { MESSAGES_EN } from '../../../../../strings/materias/materias-ingles.messages';

/** Vista mínima para la lista; el mapeo HTTP espera la confirmación del contrato. */
export interface MaterialAcademico {
  id: string;
  titulo: string;
  descripcion: string;
  docente: { id: string; nombre: string };
  semestre: { id: string; etiqueta: string };
  tipo: { id: string; etiqueta: string; etiquetaEn?: string };
}

@Component({
  selector: 'app-materiales',
  standalone: true,
  templateUrl: './materiales.component.html',
  styleUrl: './materiales.component.css'
})
export class MaterialesComponent {
  private readonly languageService = inject(LanguageService);

  readonly materiales = input<MaterialAcademico[]>([]);
  readonly docenteSeleccionado = signal('');
  readonly semestreSeleccionado = signal('');
  readonly tipoSeleccionado = signal('');

  readonly docentes = computed(() => this.opciones('docente'));
  readonly semestres = computed(() => this.opciones('semestre'));
  readonly tipos = computed(() => this.opciones('tipo'));

  readonly materialesVisibles = computed(() => this.materiales().filter(material =>
    (!this.docenteSeleccionado() || material.docente.id === this.docenteSeleccionado()) &&
    (!this.semestreSeleccionado() || material.semestre.id === this.semestreSeleccionado()) &&
    (!this.tipoSeleccionado() || material.tipo.id === this.tipoSeleccionado())
  ));

  get MESSAGES() {
    return this.languageService.getMessages(MESSAGES, MESSAGES_EN);
  }

  etiquetaTipo(material: MaterialAcademico): string {
    return this.languageService.isEnglish()
      ? material.tipo.etiquetaEn ?? material.tipo.etiqueta
      : material.tipo.etiqueta;
  }

  actualizarDocente(event: Event): void {
    this.docenteSeleccionado.set((event.target as HTMLSelectElement).value);
  }

  actualizarSemestre(event: Event): void {
    this.semestreSeleccionado.set((event.target as HTMLSelectElement).value);
  }

  actualizarTipo(event: Event): void {
    this.tipoSeleccionado.set((event.target as HTMLSelectElement).value);
  }

  private opciones(campo: 'docente' | 'semestre' | 'tipo') {
    const opciones = new Map<string, string>();
    for (const material of this.materiales()) {
      if (campo === 'docente') {
        opciones.set(material.docente.id, material.docente.nombre);
      } else if (campo === 'semestre') {
        opciones.set(material.semestre.id, material.semestre.etiqueta);
      } else {
        opciones.set(material.tipo.id, this.etiquetaTipo(material));
      }
    }
    return [...opciones].map(([id, etiqueta]) => ({ id, etiqueta }));
  }
}
