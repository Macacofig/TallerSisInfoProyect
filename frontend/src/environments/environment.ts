/**
 * Variables de entorno del frontend.
 *
 * Se leen del archivo `.env` de `frontend/` al iniciar, compilar o probar
 * (gracias a @ngx-env/builder). Una variable definida en el entorno del
 * proceso tiene prioridad sobre `.env`.
 */
const BACKEND_URL_POR_DEFECTO = 'https://tallersisinfoproyect.onrender.com';
const LOCAL_BACKEND_URL_POR_DEFECTO = 'http://localhost:8081';

function sinBarraFinal(valor: string): string {
  return valor.trim().replace(/\/+$/, '');
}

export const ENV = {
  /** Backend remoto, sin /api. */
  BACKEND_URL: sinBarraFinal(
    import.meta.env.BACKEND_URL || BACKEND_URL_POR_DEFECTO
  ),
  /** Backend local que se comprueba al abrir el frontend desde localhost. */
  LOCAL_BACKEND_URL: sinBarraFinal(
    import.meta.env.LOCAL_BACKEND_URL || LOCAL_BACKEND_URL_POR_DEFECTO
  ),
};
