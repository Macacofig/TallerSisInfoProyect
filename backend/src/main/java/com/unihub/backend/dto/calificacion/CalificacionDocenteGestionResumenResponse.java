package com.unihub.backend.dto.calificacion;

import java.util.List;

public record CalificacionDocenteGestionResumenResponse(
        String gestion,
        Integer anio,
        String semestre,
        List<String> gestionesOriginales,
        long cantidadEvaluaciones,
        List<DocenteResumen> docentes
) {
    public record DocenteResumen(
            Long idDocente,
            String nombreDocente,
            long cantidadEvaluaciones,
            Double claridadExplicacionesPromedio,
            Double metodologiaPromedio,
            Double relacionClasesEvaluacionesPromedio
    ) {
    }
}
