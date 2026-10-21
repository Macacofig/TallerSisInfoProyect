package com.unihub.backend.dto.ayudante;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AyudanteMateriaRequest(
        @NotNull Long idEstudiante,
        @NotNull Long idMateria,
        @NotBlank String horario
) {
}