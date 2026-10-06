package com.unihub.backend.dto.horario;

import java.util.List;

public record HorarioResponse(
        List<HorarioResultadoResponse> soluciones
) {
}
