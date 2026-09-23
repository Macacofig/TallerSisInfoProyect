package com.unihub.backend.mapper;

import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.dto.calificacion.CalificacionDocenteResponse;
import com.unihub.backend.entity.CalificacionDocente;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Materia;
import org.springframework.stereotype.Component;

@Component
public class CalificacionDocenteMapper {

    public CalificacionDocente toEntity(CalificacionDocenteRequest request, Docente docente, Materia materia) {
        return new CalificacionDocente(
                docente,
                materia,
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
                calificacion.getMateria().getId(),
                calificacion.getIdEstudiante(),
                calificacion.getClaridadExplicaciones(),
                calificacion.getMetodologia(),
                calificacion.getRelacionClasesEvaluaciones(),
                calificacion.getGestion()
        );
    }

    public CalificacionDocente toEntity(CalificacionDocenteRequest request, Docente docente) {
        return toEntity(request, docente, docente.getMateria());
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