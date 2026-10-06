package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record HorarioBloqueResultadoResponse(
        @JsonProperty("materia") String materia,
        @JsonProperty("docente") String docente,
        @JsonProperty("horarios") List<HorarioBloqueGeneradoResponse> horarios
) {
}
