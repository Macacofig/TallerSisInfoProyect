-- ============================================================================
-- UniHub - Esquema de base de datos (PostgreSQL)
-- Generado a partir de las entidades JPA de backend/src/main/java/com/unihub/backend/entity
-- Nota: todos los identificadores y datos se almacenan en minúsculas,
--       respetando tildes y la letra ñ.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- materias
-- ----------------------------------------------------------------------------
CREATE TABLE materias (
    id             BIGSERIAL PRIMARY KEY,
    codigo         VARCHAR(255) NOT NULL UNIQUE,
    nombre         VARCHAR(255) NOT NULL,
    carrera        VARCHAR(255) NOT NULL,
    semestre       INTEGER      NOT NULL,
    prerequisitos  TEXT[]       NOT NULL DEFAULT '{}',
    carrera_total  TEXT[]       NOT NULL DEFAULT '{}'
);

-- ----------------------------------------------------------------------------
-- estudiantes
-- ----------------------------------------------------------------------------
CREATE TABLE estudiantes (
    id                 BIGSERIAL PRIMARY KEY,
    nombre             VARCHAR(255) NOT NULL,
    contrasena         VARCHAR(255) NOT NULL,
    telefono           VARCHAR(255) NOT NULL,
    correo_electronico VARCHAR(255) NOT NULL UNIQUE,
    carrera            VARCHAR(255) NOT NULL
);

-- ----------------------------------------------------------------------------
-- docentes
-- ----------------------------------------------------------------------------
CREATE TABLE docentes (
    id     BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

-- ----------------------------------------------------------------------------
-- docente_materia
-- ----------------------------------------------------------------------------
CREATE TABLE docente_materia (
    id         BIGSERIAL PRIMARY KEY,
    id_docente BIGINT NOT NULL REFERENCES docentes (id),
    id_materia BIGINT NOT NULL REFERENCES materias (id),
    CONSTRAINT uk_docente_materia UNIQUE (id_docente, id_materia)
);

-- ----------------------------------------------------------------------------
-- calificacion_docente
-- ----------------------------------------------------------------------------
CREATE TABLE calificacion_docente (
    id                            BIGSERIAL PRIMARY KEY,
    id_docente                    BIGINT       NOT NULL REFERENCES docentes (id),
    id_materia                    BIGINT       NOT NULL REFERENCES materias (id),
    id_estudiante                 BIGINT       REFERENCES estudiantes (id),
    claridad_explicaciones        INTEGER      NOT NULL,
    metodologia                   INTEGER      NOT NULL,
    relacion_clases_evaluaciones  INTEGER      NOT NULL,
    gestion                       VARCHAR(255) NOT NULL,
    CONSTRAINT uk_calificacion_docente UNIQUE (id_estudiante, id_docente, id_materia)
);

-- ----------------------------------------------------------------------------
-- calificacion_materia
-- ----------------------------------------------------------------------------
CREATE TABLE calificacion_materia (
    id                  BIGSERIAL PRIMARY KEY,
    id_materia          BIGINT       NOT NULL REFERENCES materias (id),
    id_estudiante       BIGINT       REFERENCES estudiantes (id),
    dificultad          INTEGER      NOT NULL,
    carga               INTEGER      NOT NULL,
    conocimiento_previo INTEGER      NOT NULL,
    prerequisitos_text  VARCHAR(255) NOT NULL,
    predominio          VARCHAR(255) NOT NULL,
    gestion             VARCHAR(255) NOT NULL
);
