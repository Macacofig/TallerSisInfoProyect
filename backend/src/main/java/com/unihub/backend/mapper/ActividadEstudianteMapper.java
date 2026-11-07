package com.unihub.backend.mapper;

import com.unihub.backend.dto.actividad.ActividadEstudianteResponse;
import com.unihub.backend.entity.ActividadEstudiante;
import org.springframework.stereotype.Component;

@Component
public class ActividadEstudianteMapper {

    public ActividadEstudianteResponse toResponse(ActividadEstudiante actividad) {
        return new ActividadEstudianteResponse(
                actividad.getId(),
                actividad.getEstudiante().getId(),
                actividad.getTitulo(),
                actividad.getDescripcion(),
                actividad.getFechaHoraRegistro(),
                actividad.getEstado().name()
        );
    }
}
