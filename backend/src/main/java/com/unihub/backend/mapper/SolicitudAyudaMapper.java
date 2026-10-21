package com.unihub.backend.mapper;

import com.unihub.backend.dto.ayudante.SolicitudAyudaResponse;
import com.unihub.backend.entity.SolicitudAyuda;
import org.springframework.stereotype.Component;

@Component
public class SolicitudAyudaMapper {

    public SolicitudAyudaResponse toResponse(SolicitudAyuda solicitud) {
        return new SolicitudAyudaResponse(
                solicitud.getId(),
                solicitud.getEstudiante().getId(),
                solicitud.getEstudiante().getNombre(),
                solicitud.getAyudante().getId(),
                solicitud.getAyudante().getEstudiante().getNombre(),
                solicitud.getMateria().getId(),
                solicitud.getMateria().getCodigo(),
                solicitud.getMateria().getNombre(),
                solicitud.getPeticion(),
                solicitud.getEstado().name()
        );
    }
}