package com.unihub.backend.mapper;

import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.entity.Estudiante;
import org.springframework.stereotype.Component;

@Component
public class EstudianteMapper {

    public EstudianteResponse toResponse(Estudiante estudiante) {
        return new EstudianteResponse(
                estudiante.getId(),
                estudiante.getNombre(),
                estudiante.getTelefono(),
                estudiante.getCorreoElectronico(),
                estudiante.getCarrera()
        );
    }
}
