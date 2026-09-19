package com.unihub.backend.dto.calificacion;

public record CalificacionDocentePromedioResponse(
        Long idDocente,
        String gestionDesde,
        String gestionHasta,
        Double claridadExplicacionesPromedio,
        Double metodologiaPromedio,
        Double relacionClasesEvaluacionesPromedio
) {
}