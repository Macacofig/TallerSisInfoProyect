package com.unihub.backend.dto.materia;

public record MateriaResponse(

        Long id,
        String codigo,
        String nombre,
        String carrera,
        Integer semestre

) {
}