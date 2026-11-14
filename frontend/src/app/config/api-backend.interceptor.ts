import { HttpInterceptorFn } from '@angular/common/http';
import { defer, from, switchMap } from 'rxjs';
import { APP_CONFIG } from './app-config';
import { LOCAL_BACKEND_URL } from './app-env.generated';

const REMOTE_API: string = APP_CONFIG.API.BASE_URL;
const LOCAL_API: string = LOCAL_BACKEND_URL;

const HOSTS_LOCALES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const ESPERA_MAXIMA_PROBE_MS = 2000;

/**
 * Crea un interceptor que elige entre el backend local y el remoto.
 *
 * - Frontend abierto desde localhost: usa el backend local si responde;
 *   de lo contrario, usa el backend remoto.
 * - Frontend desplegado: usa siempre el backend remoto.
 */
export function crearApiBackendInterceptor(remoto: string, local: string): HttpInterceptorFn {

  let backendSeleccionado: Promise<string> | null = null;

  /**
   * Comprueba si el backend local está disponible.
   */
  async function isLocalBackendAvailable(): Promise<boolean> {
    const controller = new AbortController();

    // Tiempo máximo de espera: 2 segundos.
    const timeout = setTimeout(() => controller.abort(), ESPERA_MAXIMA_PROBE_MS);

    try {
      const response = await fetch(
        `${local}${APP_CONFIG.API.ENDPOINTS.TEST}`,
        {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        }
      );

      return response.ok;

    } catch {
      console.warn('Backend local no disponible. Se utilizará el backend remoto.');
      return false;

    } finally {
      clearTimeout(timeout);
    }
  }

  async function selectBackend(): Promise<string> {

    // En un entorno sin navegador (SSR o pruebas) no hay backend local.
    if (typeof window === 'undefined') {
      return remoto;
    }

    // Si ambos apuntan al mismo lugar no hace falta comprobar nada.
    if (local === remoto) {
      return remoto;
    }

    // Frontend desplegado: usar directamente el backend remoto.
    if (!HOSTS_LOCALES.has(window.location.hostname)) {
      return remoto;
    }

    console.log('Comprobando disponibilidad del backend local...');

    if (await isLocalBackendAvailable()) {
      console.log('Backend local disponible:', local);
      return local;
    }

    console.warn('Backend local apagado. Utilizando backend remoto:', remoto);
    return remoto;
  }

  return (request, next) => {

    // Solo interceptar peticiones dirigidas a nuestra API.
    if (!request.url.startsWith(remoto + '/')) {
      return next(request);
    }

    return defer(() => {

      // Seleccionar el backend una sola vez.
      backendSeleccionado ??= selectBackend();

      return from(backendSeleccionado).pipe(
        switchMap((backend) => {

          // Sustituir la URL del backend.
          const url = backend + request.url.slice(remoto.length);

          return next(request.clone({ url }));
        })
      );
    });
  };
}

/**
 * Interceptor HTTP de la aplicación.
 *
 * Las peticiones se crean con la URL del backend remoto y aquí se reemplaza
 * por el backend elegido cuando corresponde.
 */
export const apiBackendInterceptor = crearApiBackendInterceptor(REMOTE_API, LOCAL_API);
