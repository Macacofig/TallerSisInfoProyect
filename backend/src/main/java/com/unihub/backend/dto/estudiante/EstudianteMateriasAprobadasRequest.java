package com.unihub.backend.dto.estudiante;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record EstudianteMateriasAprobadasRequest(
        @NotNull(message = "La lista de materias es obligatoria")
        List<String> materias
) {
    public EstudianteMateriasAprobadasRequest {
        materias = materias == null ? null : materias.stream()
                .filter(materia -> materia != null && !materia.isBlank())
                .map(String::trim)
                .toList();
    }
}
