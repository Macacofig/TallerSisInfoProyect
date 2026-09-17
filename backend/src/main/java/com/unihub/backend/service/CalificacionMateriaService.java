package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionMateriaRequest;
import com.unihub.backend.dto.calificacion.CalificacionMateriaPromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionMateriaResponse;
import com.unihub.backend.entity.CalificacionMateria;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.CalificacionMateriaMapper;
import com.unihub.backend.repository.CalificacionMateriaRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    public Optional<CalificacionMateriaPromedioResponse> obtenerPromediosPorMateria(Long idMateria) {
	return crearPromedios(idMateria, null, null, calificacionRepository.findByMateriaId(idMateria));
    }

	public Optional<CalificacionMateriaResponse> obtenerPorEstudiante(Long idEstudiante, Long idMateria) {
	return calificacionRepository.findFirstByIdEstudianteAndMateriaId(idEstudiante, idMateria)
		.map(calificacionMapper::toResponse);
    }

    public Optional<CalificacionMateriaResponse> actualizar(
		Long idEstudiante,
		Long idMateria,
		CalificacionMateriaRequest request
	) {
	return calificacionRepository.findFirstByIdEstudianteAndMateriaId(idEstudiante, idMateria)
		.map(calificacion -> {
		    calificacionMapper.actualizar(calificacion, request);
		    return calificacionMapper.toResponse(calificacionRepository.save(calificacion));
		});
    }

    public boolean eliminar(Long idEstudiante, Long idMateria) {
	return calificacionRepository.findFirstByIdEstudianteAndMateriaId(idEstudiante, idMateria)
		.map(calificacion -> {
		    calificacionRepository.delete(calificacion);
		    return true;
		})
		.orElse(false);
    }

    public Optional<CalificacionMateriaPromedioResponse> obtenerPromediosPorGestion(String gestion) {
	return crearPromedios(null, gestion, gestion, calificacionRepository.findByGestion(gestion));
    }

    public List<String> obtenerGestiones() {
	return calificacionRepository.findAllByOrderByGestionAsc().stream()
		.map(CalificacionMateria::getGestion)
		.distinct()
		.collect(Collectors.toList());
    }

    public Optional<CalificacionMateriaPromedioResponse> obtenerPromediosPorRango(
		String gestionDesde,
		String gestionHasta
	) {
	return crearPromedios(
		null,
		gestionDesde,
		gestionHasta,
		calificacionRepository.findByGestionBetween(gestionDesde, gestionHasta)
	);
    }

    private Optional<CalificacionMateriaPromedioResponse> crearPromedios(
		Long idMateria,
		String gestionDesde,
		String gestionHasta,
		List<CalificacionMateria> calificaciones
	) {
	if (calificaciones.isEmpty()) {
	    return Optional.empty();
	}

	return Optional.of(new CalificacionMateriaPromedioResponse(
		idMateria,
		gestionDesde,
		gestionHasta,
		calificaciones.stream().mapToInt(CalificacionMateria::getDificultad).average().orElse(0),
		calificaciones.stream().mapToInt(CalificacionMateria::getCarga).average().orElse(0),
		calificaciones.stream().mapToInt(CalificacionMateria::getConocimientoPrevio).average().orElse(0)
	));
    }
}
