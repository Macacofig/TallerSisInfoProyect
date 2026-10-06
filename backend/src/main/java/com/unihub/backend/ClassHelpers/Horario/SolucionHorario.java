package com.unihub.backend.ClassHelpers.Horario;

import java.util.List;

public record SolucionHorario(
        int cantidadMaterias,
        int puntuacion,
        List<HorarioTrabajo> horarios
) {
}
