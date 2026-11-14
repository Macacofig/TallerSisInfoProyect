/**
 * Genera la configuración de entorno del frontend a partir de la variable
 * BACKEND_URL. El valor se busca primero en el entorno del proceso y luego en
 * los archivos .env del repositorio.
 *
 * Uso:
 *   node scripts/generate-env.mjs             -> usa un valor por defecto para desarrollo
 *   node scripts/generate-env.mjs --required   -> falla si BACKEND_URL no está definida
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = resolve(frontendDir, '..');
const salida = resolve(frontendDir, 'src', 'app', 'config', 'app-env.generated.ts');
const requerido = process.argv.includes('--required');

const FALLBACK_DESARROLLO = 'https://tallersisinfoproyect.onrender.com/';

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

const valoresEnv = {
  ...leerEnv(resolve(repoDir, '.env')),
  ...leerEnv(resolve(frontendDir, '.env')),
};

const valorCrudo = process.env.BACKEND_URL?.trim() || valoresEnv.BACKEND_URL?.trim();

if (!valorCrudo && requerido) {
  console.error(
    [
      'ERROR: BACKEND_URL no está definida.',
      'Para compilar el frontend debes definir la URL pública del backend, por ejemplo:',
      '  BACKEND_URL=https://mi-backend.example.com npm run build',
      'No incluyas /api: el script lo agrega automáticamente.',
    ].join('\n')
  );
  process.exit(1);
}

const backendUrl = normalizarUrlBackend(valorCrudo || FALLBACK_DESARROLLO);

if (!valorCrudo) {
  console.warn(
    `ADVERTENCIA: BACKEND_URL no está definida. Se usará ${backendUrl} para desarrollo.`
  );
}

const contenido = `// Archivo generado automáticamente por scripts/generate-env.mjs.
// No editar a mano: se sobrescribe al iniciar, compilar o probar el frontend.
export const BACKEND_URL = '${backendUrl.replace(/'/g, "\\'")}';
`;

writeFileSync(salida, contenido, 'utf8');
console.log(`BACKEND_URL configurada: ${backendUrl}`);
