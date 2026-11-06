BEGIN;
ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS rol VARCHAR(16);
UPDATE estudiantes SET rol = 'STUDENT' WHERE rol IS NULL;
ALTER TABLE estudiantes ALTER COLUMN rol SET DEFAULT 'STUDENT', ALTER COLUMN rol SET NOT NULL;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'estudiantes_rol_valido_check'
          AND conrelid = 'estudiantes'::regclass
    ) THEN
        ALTER TABLE estudiantes
            ADD CONSTRAINT estudiantes_rol_valido_check
            CHECK (rol IN ('STUDENT', 'ADMIN'));
    END IF;
END;
$$;
COMMIT;
