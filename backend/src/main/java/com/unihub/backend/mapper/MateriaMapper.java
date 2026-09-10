package com.unihub.backend.mapper;

import com.unihub.backend.dto.materia.MateriaResponse;
import com.unihub.backend.entity.Materia;
import org.springframework.stereotype.Component;

@Component
public class MateriaMapper {

    public MateriaResponse toResponse(Materia materia) {

        return new MateriaResponse(
                materia.getId(),
                materia.getCodigo(),
                materia.getNombre(),
                materia.getCarrera(),
                materia.getSemestre()
        );
    }
}