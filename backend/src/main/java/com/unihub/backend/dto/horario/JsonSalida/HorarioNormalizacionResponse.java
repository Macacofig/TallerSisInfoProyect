package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record HorarioNormalizacionResponse(
        @JsonProperty("sessionId") String sessionId,
        @JsonProperty("materias") List<HorarioResponse1> materias
) {
}