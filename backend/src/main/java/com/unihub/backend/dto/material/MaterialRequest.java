package com.unihub.backend.dto.material;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MaterialRequest(
        @NotBlank String titulo,
        @NotBlank String descripcion,
        @NotNull @Positive Long idMateria,
        @NotNull @Positive Long idDocente,
        Integer semestreIngresado
) {
}
