package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonProperty;

public record HorarioBloqueResponse(
        @JsonProperty("Dia") int dia,
        @JsonProperty("Horas") String horas
) {
}