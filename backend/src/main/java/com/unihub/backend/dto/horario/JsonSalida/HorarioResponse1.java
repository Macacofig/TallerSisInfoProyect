package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record HorarioResponse1(
        @JsonProperty("idMateria") Long idMateria,
        @JsonProperty("NombreMateria") String nombreMateria,
        @JsonProperty("Ofertas") List<HorarioOfertaResponse> ofertas
) {
}
