package com.unihub.backend.dto.estudiante;

import com.unihub.backend.dto.materia.MateriaResponse;

import java.util.List;

public record EstudianteMateriasAprobadasResponse(

        Long idEstudiante,
        String carrera,
        List<String> materiasAprobadas,
        List<MateriaResponse> materiasDisponibles

) {
}
