package com.unihub.backend.dto.actividad;

import java.time.LocalDateTime;

public record ActividadEstudianteResponse(
        Long id,
        Long idEstudiante,
        String titulo,
        String descripcion,
        LocalDateTime fechaHoraRegistro,
        String estado
) {
}
