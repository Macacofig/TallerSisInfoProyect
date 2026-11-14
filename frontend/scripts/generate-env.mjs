/**
 * Genera la configuración de entorno del frontend.
 *
 * BACKEND_URL       URL pública del backend remoto. Se usa como backend
 *                   principal cuando el frontend no se abre desde localhost y
 *                   como respaldo si el backend local no responde.
 * LOCAL_BACKEND_URL URL del backend local que se comprueba al abrir el
 *                   frontend desde localhost. Por defecto http://localhost:8081.
 *
 * Ambas variables se buscan primero en el entorno del proceso y luego en los
 * archivos .env del repositorio. Si BACKEND_URL no está definida se usa el
 * backend remoto de desarrollo.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = resolve(frontendDir, '..');
const salida = resolve(frontendDir, 'src', 'app', 'config', 'app-env.generated.ts');

const FALLBACK_REMOTO = 'https://tallersisinfoproyect.onrender.com/';
const LOCAL_POR_DEFECTO = 'http://localhost:8081';

function leerEnv(ruta) {
  if (!existsSync(ruta)) {
    return {};
  }

  const valores = {};

  for (const lineaOriginal of readFileSync(ruta, 'utf8').split(/\r?\n/)) {
    const linea = lineaOriginal.trim();

    if (!linea || linea.startsWith('#')) {
      continue;
    }

    const separador = linea.indexOf('=');

    if (separador === -1) {
      continue;
    }

    const clave = linea.slice(0, separador).trim();
    let valor = linea.slice(separador + 1).trim();

    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }

    valores[clave] = valor;
  }

  return valores;
}

function normalizarUrlBackend(valor) {
  const url = valor.trim().replace(/\/+$/, '');

  if (!url) {
    return '';
  }

  return url.endsWith('/api') ? url : `${url}/api`;
}

function escapar(valor) {
  return valor.replace(/'/g, "\\'");
}

const valoresEnv = {
  ...leerEnv(resolve(repoDir, '.env')),
  ...leerEnv(resolve(frontendDir, '.env')),
};

const valorCrudo = process.env.BACKEND_URL?.trim() || valoresEnv.BACKEND_URL?.trim();
const localCrudo = process.env.LOCAL_BACKEND_URL?.trim() || valoresEnv.LOCAL_BACKEND_URL?.trim();

const backendUrl = normalizarUrlBackend(valorCrudo || FALLBACK_REMOTO);
const localBackendUrl = normalizarUrlBackend(localCrudo || LOCAL_POR_DEFECTO);

if (!valorCrudo) {
  console.warn(
    `ADVERTENCIA: BACKEND_URL no está definida. Se usará el backend remoto ${backendUrl}.`
  );
}

const contenido = `// Archivo generado automáticamente por scripts/generate-env.mjs.
// No editar a mano: se sobrescribe al iniciar, compilar o probar el frontend.
export const BACKEND_URL = '${escapar(backendUrl)}';
export const LOCAL_BACKEND_URL = '${escapar(localBackendUrl)}';
`;

writeFileSync(salida, contenido, 'utf8');
console.log(`BACKEND_URL configurada: ${backendUrl}`);
console.log(`LOCAL_BACKEND_URL configurada: ${localBackendUrl}`);
