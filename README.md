# UniHub

## 📚 Descripción

**UniHub** es una plataforma web con enfoque social diseñada para estudiantes universitarios. Su objetivo es centralizar información y herramientas que los estudiantes necesitan durante su vida académica, evitando depender exclusivamente de grupos de WhatsApp, compañeros de cursos anteriores o información dispersa.

La plataforma busca resolver tres situaciones recurrentes:

1. **Selección de materias y docentes:** facilitar que los estudiantes conozcan la experiencia de otros alumnos con determinadas materias y docentes.
2. **Obtención de información académica:** permitir consultar y compartir materiales relacionados con materias, docentes y semestres.
3. **Resolución de dudas:** conectar estudiantes con otros estudiantes que puedan ofrecer ayudantías en determinadas materias.

Además, UniHub incorpora herramientas para **organizar horarios** y un sistema de **estadísticas y gráficos** basado en las calificaciones realizadas por los estudiantes.

---

# 🛠️ Tecnologías utilizadas

## Frontend

### Angular

**Puerto de desarrollo:**

```text
http://localhost:4200
```

---

## Backend

### Java

### Spring Boot

Spring Boot se utiliza como framework para construir el backend de UniHub.

La arquitectura seguirá una separación aproximada:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Entity
    ↓
PostgreSQL
```

Spring Boot será responsable de exponer los endpoints que utilizará Angular.

**Puerto del backend:**

```text
http://localhost:8081
```

---

## Base de datos

### PostgreSQL

PostgreSQL será utilizado como sistema gestor de base de datos.

Almacenará información relacionada con:

* Estudiantes.
* Materias.
* Docentes.
* Materiales.
* Reseñas.
* Ayudantías.
* Solicitudes.
* Horarios.
* Entre otros datos del sistema.

**Puerto de Desarrollo:**

```text
5432
```

---

## ORM

### Hibernate / JPA

Se utilizará **JPA** junto con **Hibernate** para facilitar la comunicación entre las entidades Java y las tablas de PostgreSQL.

Esto permitirá trabajar con objetos Java en lugar de realizar manualmente todas las operaciones SQL.

---

### Docker

Para levantar el proyecto:

```bash
docker compose up -d --build
```

El backend requiere `JWT_SECRET` en el archivo `.env` de la raíz. Usa una clave aleatoria de al menos 32 bytes y no la subas al repositorio. La duración predeterminada del token es de 3600 segundos y se puede cambiar con `JWT_EXPIRATION_SECONDS`.

Abre el frontend en `http://localhost:4200/materias`. Usa `localhost`, ya que es el origen permitido por el backend en la configuración local.

Docker sincroniza `frontend/src` con el contenedor y Angular detecta los cambios automáticamente. Si cambias dependencias o configuración del frontend, actualiza solo ese servicio con `docker compose up -d --no-deps --build frontend`. Evita ejecutar a la vez `npm start` en el puerto 4200 mientras el frontend de Docker está activo.

Para detenerlo:

```bash
docker compose down
```

Para consultar el estado:

```bash
docker compose ps
```

---

# ⚙️ Puesta en marcha

## Requisitos

Para ejecutar el proyecto se necesita tener instalado:

* Node.js
* npm
* Angular CLI
* Java JDK
* Maven Wrapper
* Docker
* Docker Compose
* Git

Las versiones utilizadas durante el desarrollo pueden consultarse mediante:

```bash
node -v
npm -v
ng version

java -version
javac -version
./mvnw -version

docker --version
docker compose version

git --version
```

## Catalog administration

Adding docentes and linking them to materias requires `X-Catalog-Admin-Token`. Set `CATALOG_ADMIN_TOKEN` in the root `.env` to a private random secret of at least 32 bytes. Leave it empty to keep these catalog write operations disabled. Do not reuse `JWT_SECRET` for this purpose.

## HTTPS for a self-hosted backend

The backend can terminate HTTPS directly when deployed with a PKCS12 certificate. Place the certificate at the configured host path and set `SERVER_SSL_ENABLED=true`, `SERVER_SSL_KEY_STORE_HOST_PATH`, `SERVER_SSL_KEY_STORE`, `SERVER_SSL_KEY_STORE_PASSWORD`, and `SERVER_SSL_KEY_ALIAS` in the deployment environment. The Compose file mounts the certificate read-only and publishes the configured backend port. Keep the keystore password outside version control. The default `SERVER_SSL_ENABLED=false` is for local development; the deployed frontend must use the matching HTTPS backend URL.

# 🚀 Funcionalidades
