package com.unihub.backend.dto.material;

public record SolicitudMaterialResponse(
        Long id,
        String titulo,
        Long idEstudiante,
        String nombreEstudiante,
        Long idMaterial,
        String linkMaterial,
        String estado
) {
}
