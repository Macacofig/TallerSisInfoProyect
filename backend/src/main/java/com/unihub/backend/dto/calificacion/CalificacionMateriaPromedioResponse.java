package com.unihub.backend.dto.calificacion;

public record CalificacionMateriaPromedioResponse(
        Long idMateria,
        String gestionDesde,
        String gestionHasta,
        Double dificultadPromedio,
        Double cargaPromedio,
        Double conocimientoPrevioPromedio
) {
}