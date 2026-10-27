package com.unihub.backend.dto.ayudante;

public record SolicitudAyudaResponse(
        Long id,
        Long idEstudiante,
        String nombreEstudiante,
        Long idAyudante,
        String nombreAyudante,
        Long idMateria,
        String codigoMateria,
        String nombreMateria,
        String peticion,
        String estado
) {
}