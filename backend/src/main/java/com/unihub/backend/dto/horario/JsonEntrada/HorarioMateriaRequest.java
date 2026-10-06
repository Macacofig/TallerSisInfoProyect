package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record HorarioMateriaRequest(
        @JsonProperty("SiglaMateria1") @JsonAlias({"siglaMateria1", "siglaMateria"}) String siglaMateria1,
        @JsonProperty("Paralelo1") @JsonAlias({"paralelo1", "paralelo"}) Integer paralelo1,
        @JsonProperty("NombreMateria1") @JsonAlias({"nombreMateria1", "nombreMateria"}) String nombreMateria1,
        @JsonProperty("Horarios") @JsonAlias("horarios") List<HorarioBloqueRequest> horarios
) {
}
