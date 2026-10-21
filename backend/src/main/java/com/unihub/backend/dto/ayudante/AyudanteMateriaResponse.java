package com.unihub.backend.dto.ayudante;

public record AyudanteMateriaResponse(
        Long id,
        Long idEstudiante,
        String nombreEstudiante,
        Long idMateria,
        String codigoMateria,
        String nombreMateria,
        String horario,
        String estado
) {
}