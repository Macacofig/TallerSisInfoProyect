
import { HttpInterceptorFn } from '@angular/common/http';
import { defer, from, switchMap } from 'rxjs';
import { APP_CONFIG } from './app-config';

const REMOTE_API = APP_CONFIG.API.BASE_URL;
const LOCAL_API = 'http://localhost:8081/api';

let selectedBackend: Promise<string> | null = null;

/**
 * Comprueba si el backend local está disponible.
 */
async function isLocalBackendAvailable(): Promise<boolean> {
  const controller = new AbortController();

  // Tiempo máximo de espera: 2 segundos.
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(
      `${LOCAL_API}${APP_CONFIG.API.ENDPOINTS.TEST}`,
      {
        method: 'GET',
        signal: controller.signal,
      }
    );

    return response.ok;

  } catch (error) {
    console.warn(
      'Backend local no disponible. Se utilizará el backend remoto.',
      error
    );

    return false;

  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Selecciona automáticamente el backend.
 */
async function selectBackend(): Promise<string> {

  // Si no existe navegador, utilizar backend remoto.
  if (typeof window === 'undefined') {
    return REMOTE_API;
  }

  const hostname = window.location.hostname;

  // Si el frontend NO es local, utilizar directamente el remoto.
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    console.log('Utilizando backend remoto:', REMOTE_API);
    return REMOTE_API;
  }

  // Si el frontend es local, comprobar el backend local.
  console.log('Comprobando disponibilidad del backend local...');

  const localAvailable = await isLocalBackendAvailable();

  if (localAvailable) {
    console.log('Backend local disponible:', LOCAL_API);
    return LOCAL_API;
  }

  console.warn('Backend local apagado. Utilizando backend remoto.');

  return REMOTE_API;
}

/**
 * Interceptor HTTP.
 */
export const apiBackendInterceptor: HttpInterceptorFn = (request, next) => {

  // Solo interceptar peticiones dirigidas a nuestra API.
  if (!request.url.startsWith(REMOTE_API + '/')) {
    return next(request);
  }

  return defer(() => {

    // Seleccionar el backend una sola vez.
    selectedBackend ??= selectBackend();

    return from(selectedBackend).pipe(
      switchMap((backend) => {

        // Sustituir la URL del backend.
        const url = backend + request.url.slice(REMOTE_API.length);

        return next(request.clone({ url }));
      })
    );
  });
};
