package com.unihub.backend.mapper;

import com.unihub.backend.dto.calificacion.CalificacionMateriaRequest;
import com.unihub.backend.dto.calificacion.CalificacionMateriaResponse;
import com.unihub.backend.entity.CalificacionMateria;
import com.unihub.backend.entity.Materia;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CalificacionMateriaMapper {

    public CalificacionMateria toEntity(CalificacionMateriaRequest request, Materia materia) {
        String prerequisitos = request.prerequisitos().stream()
                .map(String::trim)
                .collect(Collectors.joining(","));

        return new CalificacionMateria(
                materia,
                request.idEstudiante(),
                request.dificultad(),
                request.carga(),
                request.conocimientoPrevio(),
                prerequisitos,
                request.predominio(),
                request.gestion()
        );
    }

    public CalificacionMateriaResponse toResponse(CalificacionMateria calificacion) {
        return new CalificacionMateriaResponse(
                calificacion.getId(),
                calificacion.getMateria().getId(),
                calificacion.getIdEstudiante(),
                calificacion.getDificultad(),
                calificacion.getCarga(),
                calificacion.getConocimientoPrevio(),
                calificacion.getPrerequisitosText(),
                calificacion.getPredominio(),
                calificacion.getGestion()
        );
    }

    public void actualizar(CalificacionMateria calificacion, CalificacionMateriaRequest request) {
        String prerequisitos = request.prerequisitos().stream()
                .map(String::trim)
                .collect(Collectors.joining(","));

        calificacion.actualizar(
                request.dificultad(),
                request.carga(),
                request.conocimientoPrevio(),
                prerequisitos,
                request.predominio(),
                request.gestion()
        );
    }
}