package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionRequest;
import com.unihub.backend.dto.calificacion.CalificacionResponse;
import com.unihub.backend.entity.CalificacionMateria;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.repository.CalificacionMateriaRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CalificacionMateriaService {

    private final CalificacionMateriaRepository calificacionRepository;
    private final MateriaRepository materiaRepository;

    public CalificacionMateriaService(
	    CalificacionMateriaRepository calificacionRepository,
	    MateriaRepository materiaRepository
    ) {
	this.calificacionRepository = calificacionRepository;
	this.materiaRepository = materiaRepository;
    }

    public CalificacionResponse crear(CalificacionRequest request) {
	Materia materia = materiaRepository.findById(request.idMateria())
		.orElseThrow(() -> new IllegalArgumentException("La materia no existe"));

	String prerequisitos = request.prerequisitos().stream()
		.map(String::trim)
		.collect(Collectors.joining(","));

	CalificacionMateria calificacion = new CalificacionMateria(
		materia,
		request.idEstudiante(),
		request.dificultad(),
		request.carga(),
		request.conocimientoPrevio(),
		prerequisitos,
		request.predominio(),
		request.gestion()
	);

	return toResponse(calificacionRepository.save(calificacion));
    }

    private CalificacionResponse toResponse(CalificacionMateria calificacion) {
	return new CalificacionResponse(
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
}
