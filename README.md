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

# 🚀 Funcionalidades
