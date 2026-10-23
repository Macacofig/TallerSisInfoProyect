package com.unihub.backend.dto.ayudante;

public record SolicitudAyudanteResponse(
        Long id,
        Long idEstudiante,
        String nombreEstudiante,
        Long idMateria,
        String codigoMateria,
        String nombreMateria,
        String motivo,
        Double calificacion,
        String horarios,
        String estado
) {
}