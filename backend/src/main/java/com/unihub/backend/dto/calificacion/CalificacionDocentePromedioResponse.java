package com.unihub.backend.dto.calificacion;

public record CalificacionDocentePromedioResponse(
        Long idDocente,
        String gestionDesde,
        String gestionHasta,
        Double claridadExplicacionesPromedio,
        Double metodologiaPromedio,
        Double relacionClasesEvaluacionesPromedio,
        Long idMateria,
        String nombreDocente
) {
    public CalificacionDocentePromedioResponse(
            Long idDocente,
            String gestionDesde,
            String gestionHasta,
            Double claridadExplicacionesPromedio,
            Double metodologiaPromedio,
            Double relacionClasesEvaluacionesPromedio
    ) {
        this(idDocente, gestionDesde, gestionHasta, claridadExplicacionesPromedio,
                metodologiaPromedio, relacionClasesEvaluacionesPromedio, null, null);
    }
}