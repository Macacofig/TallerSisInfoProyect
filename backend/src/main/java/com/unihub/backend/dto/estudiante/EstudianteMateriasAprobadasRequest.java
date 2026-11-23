package com.unihub.backend.dto.estudiante;

import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

public record EstudianteMateriasAprobadasRequest(
        @NotNull(message = "La lista de materias es obligatoria")
        List<String> materias
) {
    public EstudianteMateriasAprobadasRequest {
        LinkedHashSet<String> normalizadas = new LinkedHashSet<>();
        if (materias != null) {
            for (String materia : materias) {
                if (materia != null && !materia.isBlank()) {
                    normalizadas.add(materia.trim());
                }
            }
        }
        materias = new ArrayList<>(normalizadas);
    }
}
