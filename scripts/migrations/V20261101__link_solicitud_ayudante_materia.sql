-- HU-17: asociación entre la postulación y su asignación de ayudante.
-- La columna nullable preserva registros históricos sin vínculo.
-- No modifica restricciones de unicidad existentes.

BEGIN;

ALTER TABLE solicitudes_ayudantes
    ADD COLUMN IF NOT EXISTS id_ayudante_materia BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_solicitud_ayudante_materia'
          AND conrelid = 'solicitudes_ayudantes'::regclass
    ) THEN
        ALTER TABLE solicitudes_ayudantes
            ADD CONSTRAINT fk_solicitud_ayudante_materia
            FOREIGN KEY (id_ayudante_materia)
            REFERENCES ayudante_materia (id);
    END IF;
END;
$$;

COMMIT;
