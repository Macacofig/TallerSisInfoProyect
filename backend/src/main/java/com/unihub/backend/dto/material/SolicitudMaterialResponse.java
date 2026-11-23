package com.unihub.backend.dto.material;

public record SolicitudMaterialResponse(
        Long id,
        String titulo,
        String materia,
        String docente,
        String usuario,
        String tipo,
        Long idEstudiante,
        Long idMaterial,
        String linkMaterial,
        String estado
) {
    public SolicitudMaterialResponse(
            Long id,
            String titulo,
            Long idEstudiante,
            String nombreEstudiante,
            Long idMaterial,
            String linkMaterial,
            String estado
    ) {
        this(
                id,
                titulo,
                null,
                null,
                nombreEstudiante,
                null,
                idEstudiante,
                idMaterial,
                linkMaterial,
                estado
        );
    }

    public String nombreEstudiante() {
        return usuario;
    }
}
