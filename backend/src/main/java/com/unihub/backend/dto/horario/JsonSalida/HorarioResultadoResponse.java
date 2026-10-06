package com.unihub.backend.dto.horario;

import java.util.List;

public record HorarioResultadoResponse(
        int cantidadMaterias,
        int puntuacion,
        List<HorarioBloqueResultadoResponse> horarios
) {
}
