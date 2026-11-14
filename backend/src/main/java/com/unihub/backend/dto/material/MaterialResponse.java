package com.unihub.backend.dto.material;

public record MaterialResponse(
        Long id,
        String linkMaterial,
        String titulo,
        String descripcion,
        String tipo,
        Long idMateria,
        String nombreMateria,
        Long idDocente,
        String nombreDocente,
        Integer semestreIngresado,
        String estado
) {
}
