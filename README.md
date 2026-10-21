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

## Base de datos

### PostgreSQL

PostgreSQL será utilizado como sistema gestor de base de datos.

Almacenará información relacionada con:

* Estudiantes.
* Materias.
* Docentes.
* Materiales.
* Reseñas.
* **Ayudantías.**
* Solicitudes.
* Horarios.
* Entre otros datos del sistema.

---

## ORM

### Hibernate / JPA

Se utilizará **JPA** junto con **Hibernate** para facilitar la comunicación entre las entidades Java y las tablas de PostgreSQL.

Esto permitirá trabajar con objetos Java en lugar de realizar manualmente todas las operaciones SQL.

---

### Puesta en marcha

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

# 🚀 Funcionalidades

Idea general de lo que ofrece el backend, agrupado por recurso:

* **Materia:** Mostrar materias con filtros opcionales (nombre, carrera y semestre), listar las carreras disponibles.
* **Docente:** Agregar docentes (solo administrador de catálogo), mostrar los docentes de una materia.
* **Docente-Materia:** Asociar un docente a una materia (solo administrador de catálogo).
* **Estudiante:** Registrarse, iniciar sesión (genera token JWT), actualizar su perfil.
* **Calificación Materia:** Calificar materias (crear, editar y eliminar la calificación propia), ver la calificación hecha en una materia, y obtener estadísticas y promedios de una materia o de todas las materias, con filtros por gestión y rango de gestiones.
* **Calificación Docente:** Calificar docentes (crear, editar y eliminar la calificación propia), ver la calificación hecha a un docente en una materia, y obtener promedios por docente de una materia, con filtros por gestión y rango de gestiones.
* **Horario:** Normalizar materias crudas del usuario y generar combinaciones de horarios posibles.
* **Ayudante:** Solicitar ser ayudante de una materia (con motivo, calificación y horarios), listar ayudantes aprobados por materia, dejar de ser ayudante, aprobar/rechazar solicitudes (admin), ver solicitudes pendientes (admin).
* **Solicitud de Ayuda:** Solicitar ayuda a un ayudante aprobado, listar solicitudes recibidas por ayudante, resolver solicitudes (ayudante), cancelar solicitudes (estudiante), ver solicitudes pendientes por ayudante.
* **Test:** Comprobar el estado de la API.
