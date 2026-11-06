import { HttpInterceptorFn } from '@angular/common/http';
import { defer, from, switchMap } from 'rxjs';
import { APP_CONFIG } from './app-config';

const REMOTE_API = APP_CONFIG.API.BASE_URL;
const LOCAL_API = 'http://localhost:8081/api';

let selectedBackend: Promise<string> | null = null;

async function selectBackend(): Promise<string> {
  if (typeof window === 'undefined') {
    return REMOTE_API;
  }

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return LOCAL_API;
  }

  return REMOTE_API;
}

export const apiBackendInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(REMOTE_API + '/')) {
    return next(request);
  }

  return defer(() => {
    selectedBackend ??= selectBackend();

    return from(selectedBackend).pipe(
      switchMap((backend) => {
        const url = backend + request.url.slice(REMOTE_API.length);
        return next(request.clone({ url }));
      })
    );
  });
};