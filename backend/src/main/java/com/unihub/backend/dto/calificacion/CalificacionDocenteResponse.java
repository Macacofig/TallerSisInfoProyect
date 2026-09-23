package com.unihub.backend.dto.calificacion;

public record CalificacionDocenteResponse(
        Long id,
        Long idDocente,
        Long idMateria,
        Long idEstudiante,
        Integer claridadExplicaciones,
        Integer metodologia,
        Integer relacionClasesEvaluaciones,
        String gestion
) {
    public CalificacionDocenteResponse(
            Long id,
            Long idDocente,
            Long idEstudiante,
            Integer claridadExplicaciones,
            Integer metodologia,
            Integer relacionClasesEvaluaciones,
            String gestion
    ) {
        this(id, idDocente, null, idEstudiante, claridadExplicaciones, metodologia,
                relacionClasesEvaluaciones, gestion);
    }
}