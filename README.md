# UniHub

Plataforma web para estudiantes universitarios que centraliza la consulta de materias y docentes, sus calificaciones y la organización de horarios. Compartir materiales y coordinar ayudantías forman parte del objetivo del proyecto; consulta el estado real de esos módulos en «Funcionalidades y avances».

## Tecnologías y estructura

Las versiones declaradas se encuentran en los manifiestos y Dockerfiles del repositorio.

| Componente | Tecnologías | Referencia |
| --- | --- | --- |
| Frontend | Angular 22.1, TypeScript 6.0, RxJS 7.8; Node.js 24 en Docker | [package.json](frontend/package.json), [Dockerfile](frontend/dockerfile) |
| Backend | Java 25, Spring Boot 4.1.0, Hibernate/JPA, Bean Validation | [pom.xml](backend/pom.xml), [Dockerfile](backend/dockerfile) |
| Autenticación | JWT con JJWT 0.12.6 y contraseñas BCrypt | [JwtService](backend/src/main/java/com/unihub/backend/service/JwtService.java), [PasswordConfig](backend/src/main/java/com/unihub/backend/config/PasswordConfig.java) |
| Base de datos | PostgreSQL; conexión principal a Supabase y alternativa configurada como Aiven | [DatabaseConfiguration](backend/src/main/java/com/unihub/backend/config/DatabaseConfiguration.java) |
| Scraper independiente | Node.js, Express 5 y Playwright | [package.json](scraper/package.json) |
| Pruebas | Vitest en frontend; herramientas de prueba de Spring Boot y Maven en backend | [angular.json](frontend/angular.json), [pom.xml](backend/pom.xml) |
| Entorno de desarrollo | Docker y Docker Compose | [docker-compose.yml](docker-compose.yml) |

```text
frontend/   Aplicación Angular: páginas, componentes y servicios HTTP
backend/    API Spring Boot: controller, service, repository, entity y DTO
scraper/    Servicio independiente de extracción de oferta académica
scripts/    Esquema SQL y datos de ejemplo
```

El frontend consume la API HTTP. Los controladores delegan en servicios y repositorios JPA que acceden a PostgreSQL. El scraper se ejecuta por separado: no es un servicio del Compose actual.

## Funcionalidades y avances

Esta tabla describe lo presente en el código; el funcionamiento completo debe verificarse con el entorno y los datos utilizados en cada entrega.

| Área | Avance implementado |
| --- | --- |
| Materias | Listado, búsqueda y filtros por nombre, carrera y semestre; consulta de carreras, detalle y árbol de materias. |
| Docentes | Consulta por materia; alta y asociación docente-materia protegidas con token de administración del catálogo. |
| Estudiantes | Registro, inicio de sesión con JWT y consulta/actualización del perfil propio. |
| Calificaciones de materias | Crear, editar y eliminar la calificación propia; consultas, promedios y filtros por gestión o rango de gestiones. |
| Calificaciones de docentes | Crear, editar y eliminar la calificación propia; consultas y promedios por docente y materia, con filtros de gestión. |
| Horarios | Interfaz para cargar materias y bloques; endpoints para normalizar datos y generar combinaciones. |
| Ayudantes (backend) | Postulación por materia, listado de aprobados, baja y resolución de postulaciones. Solicitudes de ayuda: creación, consulta por estudiante o ayudante, resolución y cancelación. |
| Interfaz | Navegación principal, barra lateral y textos en español e inglés. |
| Estado de la API | `GET /api/test` devuelve `UniHub funcionando`. |

**Pendientes:** aunque existen clases antiguas vacías llamadas `Ayudante`, el backend de ayudantías se implementa en `AyudanteMateria` y `SolicitudAyuda`. La sección de ayudantes del frontend todavía utiliza datos estáticos de `frontend/src/app/data/ayudantes.data.ts`; no debe confundirse con una integración completa con esos endpoints. Las clases backend de materiales siguen vacías y no hay implementación de conversación privada en esta rama. `APP_CONFIG.DEMO_MODE` está declarado en `true`; no garantiza que toda la aplicación funcione sin API.

## Requisitos

Para el procedimiento con contenedores necesitas Git, Docker Engine con Compose v2 (o Docker Desktop), acceso a PostgreSQL y credenciales del entorno de desarrollo del equipo. Deben estar disponibles el puerto 4200 y el puerto externo elegido para el backend (8081 en los ejemplos).

Con Docker no necesitas instalar Java, Maven ni Angular CLI en el host. Para ejecutar componentes fuera de Docker utiliza JDK 25, Node.js 24 y npm. El repositorio incluye Maven Wrapper y Angular CLI como dependencia local; el frontend declara `npm@11.17.0` como gestor de paquetes.

## Puesta en marcha con Docker

### 1. Obtener el proyecto

```bash
git clone https://github.com/Macacofig/TallerSisInfoProyect.git
cd TallerSisInfoProyect
```

### 2. Crear la configuración local

Desde la raíz copia [.env.example](.env.example) a `.env`:

```bash
# Bash / Git Bash
cp .env.example .env
```

```powershell
# PowerShell
Copy-Item .env.example .env
```

Completa los valores con las credenciales de desarrollo facilitadas por el equipo. El ejemplo contiene campos vacíos y no sirve directamente como configuración de arranque.

| Variables | Configuración |
| --- | --- |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Conexión alternativa: host, puerto, base, usuario y contraseña del proveedor. El puerto depende del proveedor. |
| `SUPABASE_HOST`, `SUPABASE_PORT`, `SUPABASE_DB`, `SUPABASE_USER`, `SUPABASE_PASSWORD` | Conexión principal: ajusta todos los datos al proyecto de desarrollo autorizado. |
| `BACKEND_PORT` | `8081` para acceder al backend en `http://localhost:8081`. |
| `JWT_SECRET` | Clave aleatoria privada de al menos 32 bytes. |
| `JWT_EXPIRATION_SECONDS` | `3600` para una duración de una hora. |
| `CATALOG_ADMIN_TOKEN` | Clave privada distinta del JWT, de al menos 32 bytes, para altas de docentes y asociaciones. Vacío mantiene esas operaciones deshabilitadas. |
| `PASSWORD_LEGACY_MIGRATION_ENABLED` | `false` normalmente; la migración de contraseñas antiguas no es necesaria para cuentas nuevas. |
| `SERVER_SSL_ENABLED` | `false` para HTTP local. Las demás variables `SERVER_SSL_*` corresponden al despliegue con TLS directo. |
| `CORS_ALLOWED_ORIGIN` | Está en el ejemplo y Compose, pero Spring lee `CORS_ALLOWED_ORIGINS` (plural). Véase «CORS». |
| `SCRAPER_URL` | Figura en el ejemplo, pero Compose no la transmite y el backend actual no la consume. No inicia el scraper. |

Puedes generar una clave con `openssl rand -hex 32`. En PowerShell también puedes usar:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
$rng.Dispose()
```

Copia el resultado a `JWT_SECRET` en `.env`; genera otra clave si habilitas `CATALOG_ADMIN_TOKEN`. `.env` está ignorado por Git.

### 3. Comprobar la base de datos

Compose inicia **backend y frontend**, pero no crea un servidor PostgreSQL. Configura las dos conexiones: el backend construye ambos pools, solicita primero una conexión a Supabase y, si falla, intenta la alternativa. Este mecanismo no replica ni sincroniza datos entre bases.

Las URLs JDBC generadas por Compose usan `sslmode=require`: los servidores deben aceptar PostgreSQL con SSL desde el entorno donde corre Docker. `localhost` dentro del contenedor identifica al propio contenedor, no a la computadora anfitriona.

Hibernate usa `spring.jpa.hibernate.ddl-auto=update`: puede crear o actualizar tablas al arrancar, pero no carga automáticamente datos del catálogo. En una base nueva, un listado vacío puede ser esperado.

[scripts/schema.sql](scripts/schema.sql) contiene estructura y ejemplos, pero también `DROP TABLE ... CASCADE`. Úsalo solamente para preparar una base de prueba descartable tras revisar el script; no lo ejecutes sobre datos compartidos. Para probar el login, registra una cuenta nueva desde la aplicación: los ejemplos históricos del SQL no sustituyen ese flujo.
* Estudiantes.
* Materias.
* Docentes.
* Materiales.
* Reseñas.
* **Ayudantías.**
* Solicitudes.
* Horarios.
* Entre otros datos del sistema.

### 4. Elegir la API del frontend

En [frontend/src/app/config/app-config.ts](frontend/src/app/config/app-config.ts), `APP_CONFIG.API.BASE_URL` apunta actualmente a `https://tallersisinfoproyect.onrender.com/api`.

Para probar el backend de tu computadora cambia ese valor a:

```typescript
BASE_URL: 'http://localhost:8081/api',
```

Si elegiste otro `BACKEND_PORT`, usa ese puerto. La URL la utiliza el navegador: debe contener `localhost`, no el nombre del servicio Docker `backend`. `.env` no modifica esta constante de Angular.

Conservar la URL de Render conecta el frontend al backend remoto aunque hayas iniciado uno local. Decide qué entorno vas a probar antes de registrar usuarios o calificaciones.

### 5. Construir e iniciar

Desde la raíz:

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 backend frontend
```

Abre `http://localhost:4200/materias`. Con `BACKEND_PORT=8081`, comprueba `http://localhost:8081/api/test`: debe responder `UniHub funcionando`. Esta ruta verifica la API; consulta además el catálogo para comprobar el acceso a datos.

`depends_on` ordena el inicio, pero no garantiza que la API esté lista. Espera a que el backend termine de arrancar antes de probar el frontend.

### 6. Desarrollo y cierre

Compose monta `frontend/src` en modo de solo lectura dentro del contenedor; edita en el host y Angular detectará los cambios. No ejecutes simultáneamente otro servidor en 4200.

```bash
# Si cambias dependencias o configuración del frontend
docker compose up -d --no-deps --build frontend

# Si cambias el backend
docker compose up -d --no-deps --build backend

# Detener y retirar los contenedores del proyecto
docker compose down
```

Las bases de datos externas siguen existiendo después de `down`.

## CORS

Spring lee `CORS_ALLOWED_ORIGINS`, con valor predeterminado `http://localhost:4200`. Usa `localhost` en lugar de `127.0.0.1` para coincidir con ese origen.

Compose transmite `CORS_ALLOWED_ORIGIN` en singular: cambiarla en `.env` no cambia CORS. Para otro origen debes pasar la variable plural al proceso o contenedor. Por ejemplo, crea un archivo local `compose.cors.yml` con el origen de tu frontend:

```yaml
services:
  backend:
    environment:
      CORS_ALLOWED_ORIGINS: https://frontend.example.com
```

```bash
docker compose -f docker-compose.yml -f compose.cors.yml up -d --build
```

Separa varios orígenes con comas. El esquema y el puerto forman parte del origen. Para administrar este conjunto usa los mismos argumentos `-f` también con `logs`, `ps` o `down`.

## Ejecución sin Docker

Para el backend exporta en la terminal `SUPABASE_DATASOURCE_URL`, `SUPABASE_USER`, `SUPABASE_PASSWORD`, `SPRING_DATASOURCE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD` y `JWT_SECRET`. Puedes definir también `JWT_EXPIRATION_SECONDS`, `BACKEND_PORT` y `CORS_ALLOWED_ORIGINS`. Debes proporcionar las URLs JDBC completas con la configuración SSL del proveedor: Compose ya no las construye. Spring no carga automáticamente el `.env` de la raíz.

Con JDK 25, desde `backend/` ejecuta `./mvnw spring-boot:run` (Bash; `bash mvnw spring-boot:run` si el wrapper no tiene permiso de ejecución) o `.\mvnw.cmd spring-boot:run` (PowerShell).

Desde `frontend/`, con Node.js 24:

```bash
npm ci
npm start
```

Configura antes la URL de la API como se explica en la puesta en marcha.

## Pruebas y verificación manual

Con JDK 25, desde `backend/`:

```bash
bash mvnw test
```

En PowerShell usa `.\mvnw.cmd test`. Desde `frontend/`, después de `npm ci`:

```bash
npm test -- --watch=false
npm run build
```

El Dockerfile backend compila con `-DskipTests`; construir la imagen no equivale a ejecutar las pruebas. No hay una suite e2e configurada ni una prueba automatizada funcional del scraper en su `package.json`.

Para validar el arranque completo:

1. Comprueba que los dos servicios estén iniciados y `/api/test` responda.
2. Consulta materias y carreras; verifica que las solicitudes del navegador usen la API elegida.
3. Registra una cuenta de prueba, inicia sesión y abre el perfil.
4. Con materias y docentes cargados, prueba una calificación y su consulta con esa cuenta.
5. Comprueba que no haya errores de conexión ni CORS en los logs o la consola del navegador.

## Despliegue

### Backend en Render o un servidor de contenedores

El frontend referencia un backend en Render. No hay `render.yaml` ni configuración versionada del panel del proveedor. Estos pasos describen cómo preparar un despliegue; no certifican el estado del servicio remoto.

1. Crea un servicio Docker con raíz/contexto `backend/` y Dockerfile `dockerfile`. La compilación usa Temurin JDK 25 y la ejecución Temurin JRE 25.
2. Define las variables de conexión y JWT indicadas para la ejecución sin Docker. Configura `CORS_ALLOWED_ORIGINS` con el origen HTTPS real del frontend y usa credenciales del entorno de despliegue.
3. Configura el puerto del proveedor: la aplicación resuelve `PORT`, luego `BACKEND_PORT` y finalmente `8081`. El proceso escucha ese puerto.
4. Si el proveedor termina HTTPS, conserva `SERVER_SSL_ENABLED=false` en la aplicación y usa su URL pública HTTPS. Comprueba `/api/test`, los logs y una consulta de datos.

Para terminar TLS directamente en Spring configura `SERVER_SSL_ENABLED=true`, `SERVER_SSL_KEY_STORE`, `SERVER_SSL_KEY_STORE_PASSWORD`, `SERVER_SSL_KEY_STORE_TYPE=PKCS12` y `SERVER_SSL_KEY_ALIAS`. En Compose, `SERVER_SSL_KEY_STORE_HOST_PATH` debe señalar un archivo PKCS12 existente en el host; se monta de solo lectura. Publica el puerto y cambia la URL de Angular a HTTPS.

Fuera de Compose, incluye la configuración SSL requerida por cada proveedor en las URLs JDBC. El código mantiene `ddl-auto=update`: revisa los cambios de esquema antes de desplegar sobre una base con datos.

### Frontend en un alojamiento estático

1. Ajusta `APP_CONFIG.API.BASE_URL` a la URL HTTPS pública del backend terminada en `/api` **antes** de compilar.
2. Con Node.js 24 y directorio de trabajo `frontend/`, ejecuta `npm ci` y `npm run build`.
3. Publica `frontend/dist/frontend/browser/` (o `dist/frontend/browser/` si el proveedor tiene `frontend/` como raíz).
4. Configura la reescritura de rutas Angular a `index.html`. Se incluye `frontend/public/_redirects` para proveedores que acepten ese formato; en otros configura la regla equivalente.
5. Agrega el origen público del frontend a `CORS_ALLOWED_ORIGINS` del backend. Comprueba registro/login y la recarga directa de `/materias`.

El Dockerfile de frontend y Compose ejecutan `ng serve`, un servidor de desarrollo. Para producción usa el build estático y un servidor apropiado para esos archivos. Cambiar variables del servidor estático después del build no modifica `APP_CONFIG`: debes recompilar.

## Scraper opcional

No es necesario para iniciar frontend y backend. Extrae oferta académica a `scraper/data/materias.json`; no importa automáticamente ese archivo a la base de UniHub.

Desde `scraper/`, en una computadora con sesión gráfica y Node.js:

```bash
npm ci
npx playwright install chromium
node src/app.js
```

El puerto predeterminado es 3000, configurable con `PORT`. Chromium usa `headless: false` y necesita una sesión gráfica. Consulta [scraper/README.md](scraper/README.md) para iniciar sesión y extraer datos; el login académico se completa en el navegador abierto por el scraper.

## Problemas frecuentes

| Síntoma | Comprobación |
| --- | --- |
| Error de JWT al iniciar | `JWT_SECRET` debe tener al menos 32 bytes y la duración ser un entero positivo. |
| Backend en `Restarting (1)` | El proceso termina con error y Docker lo reinicia. Ejecuta `docker compose logs --tail=150 backend` y revisa la causa del arranque; que el frontend abra no confirma que la API esté disponible. |
| `JDBC URL invalid port number` o URL `jdbc:postgresql://:/...` | Faltan valores en `.env`, especialmente `POSTGRES_HOST`, `POSTGRES_PORT` y `POSTGRES_DB`. Solicita al equipo la configuración del entorno, completa ambos grupos de conexión y recrea el backend con `docker compose up -d --force-recreate backend`. |
| Fallan ambos pools | Revisa hosts, puertos, SSL, credenciales y acceso de red; Compose no inicia PostgreSQL. |
| El frontend usa datos remotos | Revisa `APP_CONFIG.API.BASE_URL`; `.env` no cambia esa constante. |
| Error CORS | Revisa el origen exacto y `CORS_ALLOWED_ORIGINS` plural en el proceso backend. |
| Catálogo vacío | Comprueba que la base tenga datos; Hibernate no ejecuta el SQL de ejemplo. |
| `401` en una operación propia | Inicia sesión otra vez y comprueba que se envíe un JWT válido. |
| No se permite administrar docentes | Requiere `X-Catalog-Admin-Token`; con `CATALOG_ADMIN_TOKEN` vacío está deshabilitado. |
| Puerto ocupado | Libera 4200 o el puerto externo del backend; si cambias el segundo actualiza la URL de Angular. |
| El scraper no abre Chromium | Instala el navegador de Playwright y utiliza una sesión gráfica. |

## Trabajo en equipo

Cada PR incluye **Descripción**, **Historia / Issue**, **Cambios realizados**, **Pruebas realizadas** con checklist, **Capturas** del frontend, **Capturas** de terminal y **Notas**. Marca únicamente pruebas ejecutadas y adjunta evidencia correspondiente al cambio.

El grupo utiliza **squash** para integrar cada PR como un único commit en la rama de destino.
* **Materia:** Mostrar materias con filtros opcionales (nombre, carrera y semestre), listar las carreras disponibles.
* **Docente:** Agregar docentes (solo administrador de catálogo), mostrar los docentes de una materia.
* **Docente-Materia:** Asociar un docente a una materia (solo administrador de catálogo).
* **Estudiante:** Registrarse, iniciar sesión (genera token JWT), actualizar su perfil.
* **Calificación Materia:** Calificar materias (crear, editar y eliminar la calificación propia), ver la calificación hecha en una materia, y obtener estadísticas y promedios de una materia o de todas las materias, con filtros por gestión y rango de gestiones.
* **Calificación Docente:** Calificar docentes (crear, editar y eliminar la calificación propia), ver la calificación hecha a un docente en una materia, y obtener promedios por docente de una materia, con filtros por gestión y rango de gestiones.
* **Horario:** Normalizar materias crudas del usuario y generar combinaciones de horarios posibles.
* **Ayudante:** Solicitar ser ayudante de una materia (con motivo, calificación y horarios), listar ayudantes aprobados por materia, dejar de ser ayudante, aprobar/rechazar solicitudes (admin), ver solicitudes pendientes (admin).
* **Solicitud de Ayuda:** Solicitar ayuda a un ayudante aprobado, listar solicitudes recibidas por ayudante, resolver solicitudes (ayudante), cancelar solicitudes (estudiante), ver solicitudes pendientes por ayudante.
* **Solicitud de Ayudante:** Solicitar ser ayudante con motivo, calificación y horarios, listar solicitudes por estudiante/materia, aprobar/rechazar solicitudes (admin), ver solicitudes pendientes (admin).
* **Test:** Comprobar el estado de la API.
