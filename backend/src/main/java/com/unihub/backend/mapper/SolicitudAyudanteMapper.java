package com.unihub.backend.mapper;

import com.unihub.backend.dto.ayudante.SolicitudAyudanteResponse;
import com.unihub.backend.entity.SolicitudAyudante;
import org.springframework.stereotype.Component;

@Component
public class SolicitudAyudanteMapper {

    public SolicitudAyudanteResponse toResponse(SolicitudAyudante solicitud) {
        return new SolicitudAyudanteResponse(
                solicitud.getId(),
                solicitud.getEstudiante().getId(),
                solicitud.getEstudiante().getNombre(),
                solicitud.getMateria().getId(),
                solicitud.getMateria().getCodigo(),
                solicitud.getMateria().getNombre(),
                solicitud.getMotivo(),
                solicitud.getCalificacion(),
                solicitud.getHorarios(),
                solicitud.getEstado().name()
        );
    }
}