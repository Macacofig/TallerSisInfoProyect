package com.unihub.backend.dto.calificacion;

public record CalificacionMateriaPromedioMateriaResponse(
        Long idMateria,
        Double dificultadPromedio,
        Double cargaPromedio,
        Double conocimientoPrevioPromedio,
        String predominio
) {
}