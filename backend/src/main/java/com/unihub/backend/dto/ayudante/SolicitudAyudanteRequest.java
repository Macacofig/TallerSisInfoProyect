package com.unihub.backend.dto.ayudante;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SolicitudAyudanteRequest(
        @NotNull Long idEstudiante,
        @NotNull Long idMateria,
        @NotBlank String motivo,
        @NotNull @Positive Double calificacion,
        @NotBlank String horarios
) {
}