package com.unihub.backend.ClassHelpers.Horario;

import java.time.LocalTime;

public record HorarioTrabajo(
        Long materiaId,
        Long docenteId,
        int dia,
        LocalTime horaInicio,
        LocalTime horaFin,
        int paralelo
) {
}
