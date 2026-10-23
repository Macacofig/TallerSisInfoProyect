package com.unihub.backend.dto.ayudante;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SolicitudAyudaRequest(
        @NotNull Long idEstudiante,
        @NotNull Long idAyudante,
        @NotNull Long idMateria,
        @NotBlank String peticion
) {
}