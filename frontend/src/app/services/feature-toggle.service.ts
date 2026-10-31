import { Injectable, signal } from '@angular/core';

export const FEATURE_TOGGLE_STORAGE_KEYS = {
  cambioIdioma: 'unihub-feature-cambio-idioma',
  arbolMaterias: 'unihub-feature-arbol-materias',
} as const;

@Injectable({ providedIn: 'root' })
export class FeatureToggleService {
  readonly cambioIdioma = signal(this.leerValor(FEATURE_TOGGLE_STORAGE_KEYS.cambioIdioma, true));
  readonly arbolMaterias = signal(this.leerValor(FEATURE_TOGGLE_STORAGE_KEYS.arbolMaterias, true));

  setCambioIdioma(enabled: boolean): void {
    this.cambioIdioma.set(enabled);
    this.guardarValor(FEATURE_TOGGLE_STORAGE_KEYS.cambioIdioma, enabled);
  }

  toggleCambioIdioma(): void {
    this.setCambioIdioma(!this.cambioIdioma());
  }

  setArbolMaterias(enabled: boolean): void {
    this.arbolMaterias.set(enabled);
    this.guardarValor(FEATURE_TOGGLE_STORAGE_KEYS.arbolMaterias, enabled);
  }

  toggleArbolMaterias(): void {
    this.setArbolMaterias(!this.arbolMaterias());
  }

  private leerValor(key: string, defaultValue: boolean): boolean {
    if (typeof localStorage === 'undefined') {
      return defaultValue;
    }

    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue === null) {
        return defaultValue;
      }

      if (storedValue === 'true') {
        return true;
      }

      if (storedValue === 'false') {
        return false;
      }

      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private guardarValor(key: string, value: boolean): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(key, String(value));
    } catch {
      // Mantener el estado en memoria si el almacenamiento no está disponible.
    }
  }
}
