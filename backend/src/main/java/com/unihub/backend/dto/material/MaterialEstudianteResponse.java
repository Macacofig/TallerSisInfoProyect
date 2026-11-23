package com.unihub.backend.dto.material;

public record MaterialEstudianteResponse(
        Long id,
        String titulo,
        String nombreMateria,
        String tipo,
        String estado
) {
}
