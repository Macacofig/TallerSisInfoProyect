package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record HorarioOfertaResponse(
        @JsonProperty("idDocente") Long idDocente,
        @JsonProperty("Docente") String docente,
        @JsonProperty("Paralelo") int paralelo,
        @JsonProperty("Horarios") List<HorarioBloqueResponse> horarios
) {
}
