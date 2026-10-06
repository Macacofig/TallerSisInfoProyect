package com.unihub.backend.dto.horario;

import java.util.List;

public record HorarioOfertaRequest(
        String docente,
        List<HorarioBloqueRequest> horarios
) {
}
