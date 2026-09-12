package com.unihub.backend.dto.calificacion;

public record CalificacionResponse(
        Long id,
        Long idMateria,
        Long idEstudiante,
        Integer dificultad,
        Integer carga,
        Integer conocimientoPrevio,
        String prerequisitosText,
        String predominio,
        String gestion
) {
}