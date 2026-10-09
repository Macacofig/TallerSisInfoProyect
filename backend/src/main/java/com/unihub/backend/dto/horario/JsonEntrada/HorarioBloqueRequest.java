package com.unihub.backend.dto.horario;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.unihub.backend.common.DiaDeserializer;
import tools.jackson.databind.annotation.JsonDeserialize;

public record HorarioBloqueRequest(
        @JsonProperty("DocenteNombre1") @JsonAlias({"docenteNombre1", "docenteNombre"}) String docenteNombre1,
        @JsonProperty("Dia") @JsonAlias("dia") @JsonDeserialize(using = DiaDeserializer.class) int dia,
        @JsonProperty("horas") @JsonAlias({"Horas", "horario"}) String horas
) {
}
