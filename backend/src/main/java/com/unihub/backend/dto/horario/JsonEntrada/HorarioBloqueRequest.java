package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public record HorarioBloqueRequest(
        @JsonProperty("DocenteNombre1") @JsonAlias({"docenteNombre1", "docenteNombre"}) String docenteNombre1,
        @JsonProperty("Dia") @JsonAlias("dia") int dia,
        @JsonProperty("horas") @JsonAlias({"Horas", "horario"}) String horas
) {
}
