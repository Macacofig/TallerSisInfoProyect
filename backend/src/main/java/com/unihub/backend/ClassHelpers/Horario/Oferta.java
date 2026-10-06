package com.unihub.backend.ClassHelpers.Horario;

import java.util.List;

public record Oferta(
        Long materiaId,
        Long docenteId,
        int paralelo,
        List<HorarioTrabajo> horarios,
        int puntuacion
) {
}
