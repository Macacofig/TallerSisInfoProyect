package com.unihub.backend.dto.horario;

import com.unihub.backend.common.DiaDeserializer;
import tools.jackson.databind.annotation.JsonDeserialize;

public record HorarioBloqueFiltroRequest(
        @JsonDeserialize(using = DiaDeserializer.class) int dia,
        String horaInicio,
        String horaFin
) {
}
