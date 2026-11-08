package com.unihub.backend.dto.estudiante;

import java.util.List;

public record EstudianteMateriasAprobadasResponse(
        Long idEstudiante,
        List<String> materiasAprobadas
) {
}
