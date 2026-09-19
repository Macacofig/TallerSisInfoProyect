package com.unihub.backend.mapper;

import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.dto.calificacion.CalificacionDocenteResponse;
import com.unihub.backend.entity.CalificacionDocente;
import com.unihub.backend.entity.Docente;
import org.springframework.stereotype.Component;

@Component
public class CalificacionDocenteMapper {

    public CalificacionDocente toEntity(CalificacionDocenteRequest request, Docente docente) {
        return new CalificacionDocente(
                docente,
                request.idEstudiante(),
                request.claridadExplicaciones(),
                request.metodologia(),
                request.relacionClasesEvaluaciones(),
                request.gestion()
        );
    }

    public CalificacionDocenteResponse toResponse(CalificacionDocente calificacion) {
        return new CalificacionDocenteResponse(
                calificacion.getId(),
                calificacion.getDocente().getId(),
                calificacion.getIdEstudiante(),
                calificacion.getClaridadExplicaciones(),
                calificacion.getMetodologia(),
                calificacion.getRelacionClasesEvaluaciones(),
                calificacion.getGestion()
        );
    }

    public void actualizar(CalificacionDocente calificacion, CalificacionDocenteRequest request) {
        calificacion.actualizar(
                request.claridadExplicaciones(),
                request.metodologia(),
                request.relacionClasesEvaluaciones(),
                request.gestion()
        );
    }
}