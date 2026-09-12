package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionMateriaRequest;
import com.unihub.backend.dto.calificacion.CalificacionMateriaResponse;
import com.unihub.backend.entity.CalificacionMateria;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.CalificacionMateriaMapper;
import com.unihub.backend.repository.CalificacionMateriaRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.springframework.stereotype.Service;

@Service
public class CalificacionMateriaService {

    private final CalificacionMateriaRepository calificacionRepository;
    private final MateriaRepository materiaRepository;
    private final CalificacionMateriaMapper calificacionMapper;

    public CalificacionMateriaService(
	    CalificacionMateriaRepository calificacionRepository,
	    MateriaRepository materiaRepository,
	    CalificacionMateriaMapper calificacionMapper
    ) {
	this.calificacionRepository = calificacionRepository;
	this.materiaRepository = materiaRepository;
	this.calificacionMapper = calificacionMapper;
    }

    public CalificacionMateriaResponse crear(CalificacionMateriaRequest request) {
	Materia materia = materiaRepository.findById(request.idMateria())
		.orElseThrow(() -> new IllegalArgumentException("La materia no existe"));

	CalificacionMateria calificacion = calificacionMapper.toEntity(request, materia);

        return calificacionMapper.toResponse(calificacionRepository.save(calificacion));
    }
}
