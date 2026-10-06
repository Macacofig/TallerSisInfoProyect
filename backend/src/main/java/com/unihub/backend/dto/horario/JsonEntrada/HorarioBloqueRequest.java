package com.unihub.backend.dto.horario;

public record HorarioBloqueRequest(
        int dia,
        String horaInicio,
        String horaFin
) {
}
