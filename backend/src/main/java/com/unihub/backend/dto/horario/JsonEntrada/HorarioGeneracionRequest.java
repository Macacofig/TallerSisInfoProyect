package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public record HorarioGeneracionRequest(
        @JsonProperty("sessionId") @JsonAlias("sessionID") String sessionId,
        @JsonProperty("filtros") HorarioFiltroRequest filtros
) {
}
