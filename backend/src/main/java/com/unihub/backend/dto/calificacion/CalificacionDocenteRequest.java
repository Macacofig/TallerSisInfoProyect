package com.unihub.backend.dto.calificacion;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CalificacionDocenteRequest(

        @NotNull Long idDocente,
        Long idEstudiante,

        @NotNull @Min(1) @Max(10) Integer claridadExplicaciones,
        @NotNull @Min(1) @Max(10) Integer metodologia,
        @NotNull @Min(1) @Max(10) Integer relacionClasesEvaluaciones,

        @NotBlank @Pattern(regexp = "año-I|año-II") String gestion
) {
}