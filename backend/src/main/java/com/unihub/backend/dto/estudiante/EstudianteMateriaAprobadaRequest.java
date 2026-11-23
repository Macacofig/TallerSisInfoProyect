package com.unihub.backend.dto.estudiante;

import jakarta.validation.constraints.NotBlank;

public record EstudianteMateriaAprobadaRequest(
        @NotBlank(message = "La materia es obligatoria")
        String materia
) {
}
