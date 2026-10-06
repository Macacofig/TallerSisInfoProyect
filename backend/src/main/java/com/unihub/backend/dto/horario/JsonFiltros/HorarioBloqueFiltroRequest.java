package com.unihub.backend.dto.horario;

public record HorarioBloqueFiltroRequest(
        int dia,
        String horaInicio,
        String horaFin
) {
}
