package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.calificacion.CalificacionMateriaRequest;
import com.unihub.backend.dto.calificacion.CalificacionMateriaPromedioMateriaResponse;
import com.unihub.backend.dto.calificacion.CalificacionMateriaPromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionMateriaResponse;
import com.unihub.backend.entity.CalificacionMateria;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.CalificacionMateriaMapper;
import com.unihub.backend.repository.CalificacionMateriaRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
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

		CalificacionMateriaResponse response = calificacionMapper.toResponse(calificacionRepository.save(calificacion));
		LogHelper.info(CalificacionMateriaService.class, "Calificación de materia creada correctamente");
		return response;
    }

    public Optional<CalificacionMateriaPromedioResponse> obtenerPromediosPorMateria(Long idMateria) {
	return crearPromedios(idMateria, null, null, calificacionRepository.findByMateriaId(idMateria));
    }

	public List<CalificacionMateriaPromedioMateriaResponse> obtenerPromediosMaterias() {
	return calificacionRepository.findAll().stream()
		.collect(Collectors.groupingBy(
			calificacion -> calificacion.getMateria().getId(),
			LinkedHashMap::new,
			Collectors.toList()
		))
		.entrySet().stream()
		.map(entry -> crearPromedioMateria(entry.getKey(), entry.getValue()))
		.collect(Collectors.toList());
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
		    CalificacionMateriaResponse response = calificacionMapper.toResponse(calificacionRepository.save(calificacion));
		    LogHelper.info(CalificacionMateriaService.class, "Calificación de materia actualizada correctamente");
		    return response;
		});
    }

    public boolean eliminar(Long idEstudiante, Long idMateria) {
	return calificacionRepository.findFirstByIdEstudianteAndMateriaId(idEstudiante, idMateria)
		.map(calificacion -> {
		    calificacionRepository.delete(calificacion);
		    LogHelper.info(CalificacionMateriaService.class, "Calificación de materia eliminada correctamente");
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

    private CalificacionMateriaPromedioMateriaResponse crearPromedioMateria(
	    Long idMateria,
	    List<CalificacionMateria> calificaciones
    ) {
	return new CalificacionMateriaPromedioMateriaResponse(
		idMateria,
		calificaciones.stream().mapToInt(CalificacionMateria::getDificultad).average().orElse(0),
		calificaciones.stream().mapToInt(CalificacionMateria::getCarga).average().orElse(0),
		calificaciones.stream().mapToInt(CalificacionMateria::getConocimientoPrevio).average().orElse(0),
		obtenerPredominioMasFrecuente(calificaciones)
	);
    }

    private String obtenerPredominioMasFrecuente(List<CalificacionMateria> calificaciones) {
	Map<String, Long> frecuencias = new LinkedHashMap<>();
	calificaciones.stream()
		.map(CalificacionMateria::getPredominio)
		.forEach(predominio -> frecuencias.merge(predominio, 1L, Long::sum));
	return frecuencias.entrySet().stream()
		.max(Map.Entry.comparingByValue())
		.map(Map.Entry::getKey)
		.orElse(null);
    }
}
