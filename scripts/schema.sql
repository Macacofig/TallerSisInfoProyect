-- ============================================================================
-- UniHub - Esquema de base de datos (PostgreSQL)
-- Generado a partir de las entidades JPA de backend/src/main/java/com/unihub/backend/entity
-- Nota: todos los identificadores y datos se almacenan en minúsculas,
--       respetando tildes y la letra ñ.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Reinicio de la base.
-- Se eliminan en cascada las tablas relacionadas con materias junto con ella,
-- y al volver a crearlas los id se reinician desde 1.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS solicitudes_ayuda CASCADE;
DROP TABLE IF EXISTS solicitudes_ayudantes CASCADE;
DROP TABLE IF EXISTS ayudante_materia CASCADE;
DROP TABLE IF EXISTS calificacion_materia CASCADE;
DROP TABLE IF EXISTS calificacion_docente CASCADE;
DROP TABLE IF EXISTS docente_materia CASCADE;
DROP TABLE IF EXISTS estudiantes CASCADE;
DROP TABLE IF EXISTS docentes CASCADE;
DROP TABLE IF EXISTS materias CASCADE;

-- ============================================================================
-- 1) Materias (tabla base, con sus datos)
-- ============================================================================
CREATE TABLE materias (
    id             BIGSERIAL PRIMARY KEY,
    codigo         VARCHAR(255) NOT NULL UNIQUE,
    nombre         VARCHAR(255) NOT NULL,
    carrera        VARCHAR(255) NOT NULL,
    semestre       INTEGER      NOT NULL,
    prerequisitos  TEXT[]       NOT NULL DEFAULT '{}',
    carrera_total  TEXT[]       NOT NULL DEFAULT '{}'
);

-- Materias (a partir de rapido.csv).
-- carrera_total = ['ingeniería en sistemas'] para todas las materias.
INSERT INTO materias (codigo, nombre, carrera, semestre, prerequisitos, carrera_total) VALUES
('mat-123', 'álgebra lineal', 'ciencias exactas', 1, '{}'::text[], ARRAY['ingeniería en sistemas']),
('mat-122', 'matemáticas discretas', 'ciencias exactas', 1, '{}'::text[], ARRAY['ingeniería en sistemas']),
('sis-111', 'introducción a la programación', 'ingeniería en sistemas', 1, '{}'::text[], ARRAY['ingeniería en sistemas']),
('sis-121', 'ingeniería de sistemas', 'ingeniería en sistemas', 1, '{}'::text[], ARRAY['ingeniería en sistemas']),
('fil-107', 'pensamiento crítico', 'filosofía y letras', 1, '{}'::text[], ARRAY['ingeniería en sistemas']),
('mat-132', 'cálculo i', 'ciencias exactas', 2, ARRAY['mat-123'], ARRAY['ingeniería en sistemas']),
('mat-251', 'investigación operativa i', 'ciencias exactas', 2, ARRAY['mat-123'], ARRAY['ingeniería en sistemas']),
('mat-142', 'probabilidad y estadística i', 'ciencias exactas', 2, '{}'::text[], ARRAY['ingeniería en sistemas']),
('sis-112', 'programación i', 'ingeniería en sistemas', 2, ARRAY['sis-111'], ARRAY['ingeniería en sistemas']),
('sis-133', 'arquitectura computacional y sistemas operativos', 'ingeniería en sistemas', 2, ARRAY['sis-122', 'sis-121'], ARRAY['ingeniería en sistemas']),
('fhc-140', 'fhc1', 'formación humano cristiana', 2, '{}'::text[], ARRAY['ingeniería en sistemas']),
('fil-207', 'epistemología', 'filosofía y letras', 2, ARRAY['fil-107'], ARRAY['ingeniería en sistemas']),
('mat-133', 'cálculo ii', 'ciencias exactas', 3, ARRAY['mat-132'], ARRAY['ingeniería en sistemas']),
('fis-111', 'física i y laboratorio', 'ciencias exactas', 3, '{}'::text[], ARRAY['ingeniería en sistemas']),
('mat-143', 'probabilidad y estadística ii', 'ciencias exactas', 3, ARRAY['mat-142'], ARRAY['ingeniería en sistemas']),
('sis-113', 'programación ii', 'ingeniería en sistemas', 3, ARRAY['sis-112'], ARRAY['ingeniería en sistemas']),
('sis-122', 'bases de datos i', 'ingeniería en sistemas', 3, ARRAY['sis-112'], ARRAY['ingeniería en sistemas']),
('sis-161', 'metodología de la investigación', 'ingeniería en sistemas', 3, '{}'::text[], ARRAY['ingeniería en sistemas']),
('mat-252', 'investigación operativa ii y laboratorio', 'ciencias exactas', 4, ARRAY['mat-251'], ARRAY['ingeniería en sistemas']),
('sis-211', 'estructuras de datos', 'ingeniería en sistemas', 4, ARRAY['sis-113'], ARRAY['ingeniería en sistemas']),
('sis-214', 'tecnologías web i', 'ingeniería en sistemas', 4, ARRAY['sis-113', 'sis-122'], ARRAY['ingeniería en sistemas']),
('sis-221', 'bases de datos ii', 'ingeniería en sistemas', 4, ARRAY['sis-122'], ARRAY['ingeniería en sistemas']),
('sis-225', 'sistemas de información', 'ingeniería en sistemas', 4, ARRAY['sis-122'], ARRAY['ingeniería en sistemas']),
('fhc-240', 'fhc2', 'formación humano cristiana', 4, ARRAY['fhc-140'], ARRAY['ingeniería en sistemas']),
('mat-361', 'análisis de algoritmos', 'ciencias exactas', 5, ARRAY['sis-211'], ARRAY['ingeniería en sistemas']),
('sis-212', 'programación de dispositivos móviles', 'ingeniería en sistemas', 5, ARRAY['sis-113', 'sis-122'], ARRAY['ingeniería en sistemas']),
('sis-215', 'tecnologías web ii', 'ingeniería en sistemas', 5, ARRAY['sis-214', 'sis-221'], ARRAY['ingeniería en sistemas']),
('sis-251', 'ingeniería de datos', 'ingeniería en sistemas', 5, ARRAY['mat-133', 'mat-123'], ARRAY['ingeniería en sistemas']),
('sis-226', 'sistemas de soporte a las decisiones gerenciales', 'ingeniería en sistemas', 5, ARRAY['sis-225', 'sis-221'], ARRAY['ingeniería en sistemas']),
('sis-231', 'redes de computadoras i', 'ingeniería en sistemas', 5, ARRAY['sis-133'], ARRAY['ingeniería en sistemas']),
('sis-213', 'ingeniería de software', 'ingeniería en sistemas', 6, ARRAY['sis-214', 'sis-225'], ARRAY['ingeniería en sistemas']),
('sis-216', 'modelado, dinámica de sistemas y simulación', 'ingeniería en sistemas', 6, ARRAY['mat-252', 'fis-111'], ARRAY['ingeniería en sistemas']),
('sis-252', 'inteligencia artificial', 'ingeniería en sistemas', 6, ARRAY['mat-361', 'sis-251'], ARRAY['ingeniería en sistemas']),
('der-394', 'derecho de las tic y ética', 'derecho', 6, ARRAY['sis-226'], ARRAY['ingeniería en sistemas']),
('sis-227', 'taller de sistemas de información', 'ingeniería en sistemas', 6, ARRAY['sis-215', 'sis-226'], ARRAY['ingeniería en sistemas']),
('sis-233', 'redes de computadoras ii', 'ingeniería en sistemas', 6, ARRAY['sis-231'], ARRAY['ingeniería en sistemas']),
('sis-311', 'arquitectura de software', 'ingeniería en sistemas', 7, ARRAY['sis-213'], ARRAY['ingeniería en sistemas']),
('sis-312', 'gestión de calidad de sistemas', 'ingeniería en sistemas', 7, ARRAY['sis-227'], ARRAY['ingeniería en sistemas']),
('sis-351', 'machine learning', 'ingeniería en sistemas', 7, ARRAY['sis-252'], ARRAY['ingeniería en sistemas']),
('sis-325', 'ética y seguridad de sistemas', 'ingeniería en sistemas', 7, ARRAY['sis-227'], ARRAY['ingeniería en sistemas']),
('sis-331', 'computación en la nube', 'ingeniería en sistemas', 7, ARRAY['sis-233'], ARRAY['ingeniería en sistemas']),
('fhc-340', 'fhc3', 'formación humano cristiana', 7, ARRAY['fhc-240'], ARRAY['ingeniería en sistemas']),
('sis-334', 'internet de las cosas', 'ingeniería en sistemas', 7, ARRAY['sis-233'], ARRAY['ingeniería en sistemas']),
('sis-313', 'gerencia de las tic', 'ingeniería en sistemas', 8, ARRAY['sis-227'], ARRAY['ingeniería en sistemas']),
('sis-352', 'taller de sistemas inteligentes', 'ingeniería en sistemas', 8, ARRAY['sis-351'], ARRAY['ingeniería en sistemas']),
('sis-324', 'auditoría de sistemas', 'ingeniería en sistemas', 8, ARRAY['sis-312'], ARRAY['ingeniería en sistemas']),
('sis-361', 'práctica pre profesional', 'ingeniería en sistemas', 8, ARRAY['sis-351'], ARRAY['ingeniería en sistemas']),
('sis-362', 'taller de grado i', 'ingeniería en sistemas', 8, ARRAY['sis-312', 'sis-331'], ARRAY['ingeniería en sistemas']),
('sis-363', 'taller de grado ii', 'ingeniería en sistemas', 9, ARRAY['sis-362'], ARRAY['ingeniería en sistemas']);

-- ============================================================================
-- 2) Tablas dependientes (10 registros cada una)
-- ============================================================================

-- Docentes
CREATE TABLE docentes (
    id     BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

INSERT INTO docentes (nombre) VALUES
('juan pérez'),
('maría gonzález'),
('carlos rodríguez'),
('ana martínez'),
('luis ñáñez'),
('sofía vargas'),
('rodrigo flores'),
('elena quispia'),
('diego mamani'),
('carla rojas');

-- Estudiantes (contraseña de ejemplo para todos: 123456)
CREATE TABLE estudiantes (
    id                 BIGSERIAL PRIMARY KEY,
    nombre             VARCHAR(255) NOT NULL,
    contrasena         VARCHAR(255) NOT NULL,
    telefono           VARCHAR(255) NOT NULL,
    correo_electronico VARCHAR(255) NOT NULL UNIQUE,
    carrera            VARCHAR(255) NOT NULL
);

INSERT INTO estudiantes (nombre, contrasena, telefono, correo_electronico, carrera) VALUES
('pedro ramírez', '$2a$10$Cu1lbnVn60cGRs7DRY9OZ.Z9ZP4lv4rfh9SJVRXin4VOYlpeNQTHm', '77710001', 'pedro.ramirez@unihub.com', 'ingeniería en sistemas'),
('lucía flores', '$2a$10$Cu1lbnVn60cGRs7DRY9OZ.Z9ZP4lv4rfh9SJVRXin4VOYlpeNQTHm', '77710002', 'lucia.flores@unihub.com', 'ingeniería en sistemas'),
('miguel choque', '$2a$10$Cu1lbnVn60cGRs7DRY9OZ.Z9ZP4lv4rfh9SJVRXin4VOYlpeNQTHm', '77710003', 'miguel.choque@unihub.com', 'ingeniería en sistemas'),
('elena ñusta', '$2a$10$Cu1lbnVn60cGRs7DRY9OZ.Z9ZP4lv4rfh9SJVRXin4VOYlpeNQTHm', '77710004', 'elena.nusta@unihub.com', 'ingeniería en sistemas'),
('jorge quispia', '$2a$10$Cu1lbnVn60cGRs7DRY9OZ.Z9ZP4lv4rfh9SJVRXin4VOYlpeNQTHm', '77710005', 'jorge.quispia@unihub.com', 'ingeniería en sistemas'),
('andrea cárdenas', '$2a$10$Cu1lbnVn60cGRs7DRY9OZ.Z9ZP4lv4rfh9SJVRXin4VOYlpeNQTHm', '77710006', 'andrea.cardenas@unihub.com', 'ingeniería en sistemas'),
('fernando órtiz', '$2a$10$Cu1lbnVn60cGRs7DRY9OZ.Z9ZP4lv4rfh9SJVRXin4VOYlpeNQTHm', '77710007', 'fernando.ortiz@unihub.com', 'ingeniería en sistemas'),
('paola muñoz', '$2a$10$Cu1lbnVn60cGRs7DRY9OZ.Z9ZP4lv4rfh9SJVRXin4VOYlpeNQTHm', '77710008', 'paola.munoz@unihub.com', 'ingeniería en sistemas'),
('ricardo loza', '$2a$10$Cu1lbnVn60cGRs7DRY9OZ.Z9ZP4lv4rfh9SJVRXin4VOYlpeNQTHm', '77710009', 'ricardo.loza@unihub.com', 'ingeniería en sistemas'),
('valeria ibáñez', '$2a$10$Cu1lbnVn60cGRs7DRY9OZ.Z9ZP4lv4rfh9SJVRXin4VOYlpeNQTHm', '77710010', 'valeria.ibanez@unihub.com', 'ingeniería en sistemas');

-- Docente - Materia
CREATE TABLE docente_materia (
    id         BIGSERIAL PRIMARY KEY,
    id_docente BIGINT NOT NULL REFERENCES docentes (id),
    id_materia BIGINT NOT NULL REFERENCES materias (id),
    CONSTRAINT uk_docente_materia UNIQUE (id_docente, id_materia)
);

INSERT INTO docente_materia (id_docente, id_materia) VALUES
((SELECT id FROM docentes WHERE nombre = 'juan pérez'), (SELECT id FROM materias WHERE codigo = 'sis-111')),
((SELECT id FROM docentes WHERE nombre = 'juan pérez'), (SELECT id FROM materias WHERE codigo = 'sis-112')),
((SELECT id FROM docentes WHERE nombre = 'maría gonzález'), (SELECT id FROM materias WHERE codigo = 'mat-123')),
((SELECT id FROM docentes WHERE nombre = 'maría gonzález'), (SELECT id FROM materias WHERE codigo = 'mat-132')),
((SELECT id FROM docentes WHERE nombre = 'carlos rodríguez'), (SELECT id FROM materias WHERE codigo = 'sis-121')),
((SELECT id FROM docentes WHERE nombre = 'carlos rodríguez'), (SELECT id FROM materias WHERE codigo = 'sis-133')),
((SELECT id FROM docentes WHERE nombre = 'ana martínez'), (SELECT id FROM materias WHERE codigo = 'sis-122')),
((SELECT id FROM docentes WHERE nombre = 'ana martínez'), (SELECT id FROM materias WHERE codigo = 'sis-221')),
((SELECT id FROM docentes WHERE nombre = 'luis ñáñez'), (SELECT id FROM materias WHERE codigo = 'fis-111')),
((SELECT id FROM docentes WHERE nombre = 'sofía vargas'), (SELECT id FROM materias WHERE codigo = 'fil-107'));

-- Calificaciones de docentes
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

INSERT INTO calificacion_docente (id_docente, id_materia, id_estudiante, claridad_explicaciones, metodologia, relacion_clases_evaluaciones, gestion) VALUES
((SELECT id FROM docentes WHERE nombre = 'juan pérez'), (SELECT id FROM materias WHERE codigo = 'sis-111'), (SELECT id FROM estudiantes WHERE correo_electronico = 'pedro.ramirez@unihub.com'), 9, 8, 9, 'año-i'),
((SELECT id FROM docentes WHERE nombre = 'maría gonzález'), (SELECT id FROM materias WHERE codigo = 'mat-123'), (SELECT id FROM estudiantes WHERE correo_electronico = 'pedro.ramirez@unihub.com'), 8, 7, 8, 'año-i'),
((SELECT id FROM docentes WHERE nombre = 'juan pérez'), (SELECT id FROM materias WHERE codigo = 'sis-112'), (SELECT id FROM estudiantes WHERE correo_electronico = 'lucia.flores@unihub.com'), 7, 8, 9, 'año-i'),
((SELECT id FROM docentes WHERE nombre = 'ana martínez'), (SELECT id FROM materias WHERE codigo = 'sis-122'), (SELECT id FROM estudiantes WHERE correo_electronico = 'lucia.flores@unihub.com'), 9, 9, 8, 'año-ii'),
((SELECT id FROM docentes WHERE nombre = 'carlos rodríguez'), (SELECT id FROM materias WHERE codigo = 'sis-121'), (SELECT id FROM estudiantes WHERE correo_electronico = 'miguel.choque@unihub.com'), 6, 7, 7, 'año-i'),
((SELECT id FROM docentes WHERE nombre = 'juan pérez'), (SELECT id FROM materias WHERE codigo = 'sis-111'), (SELECT id FROM estudiantes WHERE correo_electronico = 'miguel.choque@unihub.com'), 8, 8, 9, 'año-ii'),
((SELECT id FROM docentes WHERE nombre = 'sofía vargas'), (SELECT id FROM materias WHERE codigo = 'fil-107'), (SELECT id FROM estudiantes WHERE correo_electronico = 'elena.nusta@unihub.com'), 9, 9, 10, 'año-i'),
((SELECT id FROM docentes WHERE nombre = 'carlos rodríguez'), (SELECT id FROM materias WHERE codigo = 'sis-133'), (SELECT id FROM estudiantes WHERE correo_electronico = 'jorge.quispia@unihub.com'), 7, 6, 8, 'año-ii'),
((SELECT id FROM docentes WHERE nombre = 'ana martínez'), (SELECT id FROM materias WHERE codigo = 'sis-221'), (SELECT id FROM estudiantes WHERE correo_electronico = 'andrea.cardenas@unihub.com'), 8, 7, 9, 'año-i'),
((SELECT id FROM docentes WHERE nombre = 'maría gonzález'), (SELECT id FROM materias WHERE codigo = 'mat-132'), (SELECT id FROM estudiantes WHERE correo_electronico = 'fernando.ortiz@unihub.com'), 6, 7, 8, 'año-ii');

-- Calificaciones de materias
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

INSERT INTO calificacion_materia (id_materia, id_estudiante, dificultad, carga, conocimiento_previo, prerequisitos_text, predominio, gestion) VALUES
((SELECT id FROM materias WHERE codigo = 'sis-111'), (SELECT id FROM estudiantes WHERE correo_electronico = 'pedro.ramirez@unihub.com'), 4, 5, 6, 'ninguno', 'practico', 'i-año'),
((SELECT id FROM materias WHERE codigo = 'mat-123'), (SELECT id FROM estudiantes WHERE correo_electronico = 'pedro.ramirez@unihub.com'), 7, 6, 5, 'ninguno', 'teorico', 'i-año'),
((SELECT id FROM materias WHERE codigo = 'sis-112'), (SELECT id FROM estudiantes WHERE correo_electronico = 'lucia.flores@unihub.com'), 5, 6, 7, 'sis-111', 'practico', 'i-año'),
((SELECT id FROM materias WHERE codigo = 'mat-132'), (SELECT id FROM estudiantes WHERE correo_electronico = 'miguel.choque@unihub.com'), 8, 7, 6, 'mat-123', 'teorico', 'ii-año'),
((SELECT id FROM materias WHERE codigo = 'sis-122'), (SELECT id FROM estudiantes WHERE correo_electronico = 'elena.nusta@unihub.com'), 6, 7, 5, 'sis-112', 'practico', 'ii-año'),
((SELECT id FROM materias WHERE codigo = 'sis-133'), (SELECT id FROM estudiantes WHERE correo_electronico = 'jorge.quispia@unihub.com'), 7, 8, 6, 'sis-121', 'practico', 'ii-año'),
((SELECT id FROM materias WHERE codigo = 'sis-221'), (SELECT id FROM estudiantes WHERE correo_electronico = 'andrea.cardenas@unihub.com'), 6, 7, 5, 'sis-122', 'practico', 'i-año'),
((SELECT id FROM materias WHERE codigo = 'mat-123'), (SELECT id FROM estudiantes WHERE correo_electronico = 'fernando.ortiz@unihub.com'), 5, 5, 6, 'ninguno', 'teorico', 'ii-año'),
((SELECT id FROM materias WHERE codigo = 'sis-121'), (SELECT id FROM estudiantes WHERE correo_electronico = 'paola.munoz@unihub.com'), 4, 6, 5, 'ninguno', 'teorico', 'i-año'),
((SELECT id FROM materias WHERE codigo = 'fis-111'), (SELECT id FROM estudiantes WHERE correo_electronico = 'ricardo.loza@unihub.com'), 6, 5, 7, 'ninguno', 'practico', 'i-año');

-- ============================================================================
-- 3) Tablas de Ayudantes y Solicitudes
-- ============================================================================

-- Ayudante - Materia
CREATE TABLE ayudante_materia (
    id             BIGSERIAL PRIMARY KEY,
    id_estudiante  BIGINT NOT NULL REFERENCES estudiantes (id),
    id_materia     BIGINT NOT NULL REFERENCES materias (id),
    horario        VARCHAR(255) NOT NULL,
    estado         VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT uk_ayudante_materia_estudiante_materia_activo UNIQUE (id_estudiante, id_materia, estado)
);

-- Solicitudes de Ayudante
CREATE TABLE solicitudes_ayudantes (
    id_solicitud_ayudante BIGSERIAL PRIMARY KEY,
    id_estudiante         BIGINT NOT NULL REFERENCES estudiantes (id),
    id_materia            BIGINT NOT NULL REFERENCES materias (id),
    motivo                TEXT NOT NULL,
    calificacion          DOUBLE PRECISION NOT NULL,
    horarios              VARCHAR(255) NOT NULL,
    estado                VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT uk_solicitud_ayudante_estudiante_materia_activo UNIQUE (id_estudiante, id_materia, estado)
);

-- Solicitudes de Ayuda
CREATE TABLE solicitudes_ayuda (
    id_solicitud_ayuda BIGSERIAL PRIMARY KEY,
    id_estudiante      BIGINT NOT NULL REFERENCES estudiantes (id),
    id_ayudante        BIGINT NOT NULL REFERENCES ayudante_materia (id),
    id_materia         BIGINT NOT NULL REFERENCES materias (id),
    peticion           TEXT NOT NULL,
    estado             VARCHAR(50) NOT NULL DEFAULT 'RESUELTA'
);
