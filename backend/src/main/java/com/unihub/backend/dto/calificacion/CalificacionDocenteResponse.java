package com.unihub.backend.dto.calificacion;

public record CalificacionDocenteResponse(
        Long id,
        Long idDocente,
        Long idEstudiante,
        Integer claridadExplicaciones,
        Integer metodologia,
        Integer relacionClasesEvaluaciones,
        String gestion
) {
}