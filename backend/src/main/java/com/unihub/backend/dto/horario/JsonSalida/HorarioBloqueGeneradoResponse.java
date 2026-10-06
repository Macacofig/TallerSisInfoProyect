package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonProperty;

public record HorarioBloqueGeneradoResponse(
        @JsonProperty("dia") int dia,
        @JsonProperty("horaInicio") String horaInicio,
        @JsonProperty("horaFin") String horaFin
) {
}