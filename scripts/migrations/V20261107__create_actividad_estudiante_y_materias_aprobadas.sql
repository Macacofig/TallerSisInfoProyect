-- HU-18. Migración incremental; no ejecutar schema.sql en bases existentes.
BEGIN;

-- Lista de materias aprobadas/cursadas por estudiante (mismo formato que materias.prerequisitos).
ALTER TABLE estudiantes
    ADD COLUMN IF NOT EXISTS materias_aprobadas TEXT[] NOT NULL DEFAULT '{}';

-- Seguimiento de actividad de cada estudiante.
CREATE TABLE IF NOT EXISTS actividad_estudiante (
    id                    BIGSERIAL PRIMARY KEY,
    id_estudiante         BIGINT NOT NULL REFERENCES estudiantes (id) ON DELETE CASCADE,
    titulo                VARCHAR(255) NOT NULL CHECK (btrim(titulo) <> ''),
    descripcion           TEXT NOT NULL CHECK (btrim(descripcion) <> ''),
    fecha_hora_registro   TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'America/La_Paz'),
    estado                VARCHAR(16) NOT NULL
        CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'REALIZADO'))
);

CREATE INDEX IF NOT EXISTS idx_actividad_estudiante_fecha
    ON actividad_estudiante (id_estudiante, fecha_hora_registro DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_actividad_estudiante_pendiente
    ON actividad_estudiante (id_estudiante, titulo) WHERE estado = 'PENDIENTE';

COMMIT;
