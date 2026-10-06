package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record HorarioResponse2(
        @JsonProperty("cantidadMaterias") int cantidadMaterias,
        @JsonProperty("puntuacion") int puntuacion,
        @JsonProperty("horarios") List<HorarioBloqueResultadoResponse> horarios
) {
}
