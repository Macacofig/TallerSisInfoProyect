package com.unihub.backend.dto.materia;

import java.util.List;

public record MateriaResponse(

        Long id,
        String codigo,
        String nombre,
        String carrera,
        Integer semestre,
        List<String> prerequisitos

) {
}
