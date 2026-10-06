package com.unihub.backend.dto.horario;

public record HorarioBloqueResultadoResponse(
        String materia,
        String docente,
        int dia,
        String hora
) {
}
