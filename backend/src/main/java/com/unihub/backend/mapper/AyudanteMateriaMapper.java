package com.unihub.backend.mapper;

import com.unihub.backend.dto.ayudante.AyudanteMateriaResponse;
import com.unihub.backend.entity.AyudanteMateria;
import org.springframework.stereotype.Component;

@Component
public class AyudanteMateriaMapper {

    public AyudanteMateriaResponse toResponse(AyudanteMateria ayudanteMateria) {
        return new AyudanteMateriaResponse(
                ayudanteMateria.getId(),
                ayudanteMateria.getEstudiante().getId(),
                ayudanteMateria.getEstudiante().getNombre(),
                ayudanteMateria.getMateria().getId(),
                ayudanteMateria.getMateria().getCodigo(),
                ayudanteMateria.getMateria().getNombre(),
                ayudanteMateria.getHorario(),
                ayudanteMateria.getEstado().name()
        );
    }
}