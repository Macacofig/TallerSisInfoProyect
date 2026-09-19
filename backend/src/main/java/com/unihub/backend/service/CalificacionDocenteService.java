package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionDocentePromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.dto.calificacion.CalificacionDocenteResponse;
import com.unihub.backend.entity.CalificacionDocente;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.mapper.CalificacionDocenteMapper;
import com.unihub.backend.repository.CalificacionDocenteRepository;
import com.unihub.backend.repository.DocenteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CalificacionDocenteService {

	private final CalificacionDocenteRepository calificacionRepository;
	private final DocenteRepository docenteRepository;
	private final CalificacionDocenteMapper calificacionMapper;

	public CalificacionDocenteService(
			CalificacionDocenteRepository calificacionRepository,
			DocenteRepository docenteRepository,
			CalificacionDocenteMapper calificacionMapper
	) {
		this.calificacionRepository = calificacionRepository;
		this.docenteRepository = docenteRepository;
		this.calificacionMapper = calificacionMapper;
	}

	public CalificacionDocenteResponse crear(CalificacionDocenteRequest request) {
		Docente docente = docenteRepository.findById(request.idDocente())
				.orElseThrow(() -> new IllegalArgumentException("El docente no existe"));

		CalificacionDocente calificacion = calificacionMapper.toEntity(request, docente);
		return calificacionMapper.toResponse(calificacionRepository.save(calificacion));
	}

	public Optional<CalificacionDocentePromedioResponse> obtenerPromediosPorDocente(Long idDocente) {
		return crearPromedios(idDocente, null, null, calificacionRepository.findByDocenteId(idDocente));
	}

	public Optional<CalificacionDocenteResponse> obtenerPorEstudiante(Long idEstudiante, Long idDocente) {
		return calificacionRepository.findFirstByIdEstudianteAndDocenteId(idEstudiante, idDocente)
				.map(calificacionMapper::toResponse);
	}

	public Optional<CalificacionDocenteResponse> actualizar(
			Long idEstudiante,
			Long idDocente,
			CalificacionDocenteRequest request
	) {
		return calificacionRepository.findFirstByIdEstudianteAndDocenteId(idEstudiante, idDocente)
				.map(calificacion -> {
					calificacionMapper.actualizar(calificacion, request);
					return calificacionMapper.toResponse(calificacionRepository.save(calificacion));
				});
	}

	public boolean eliminar(Long idEstudiante, Long idDocente) {
		return calificacionRepository.findFirstByIdEstudianteAndDocenteId(idEstudiante, idDocente)
				.map(calificacion -> {
					calificacionRepository.delete(calificacion);
					return true;
				})
				.orElse(false);
	}

	public Optional<CalificacionDocentePromedioResponse> obtenerPromediosPorGestion(String gestion) {
		return crearPromedios(null, gestion, gestion, calificacionRepository.findByGestion(gestion));
	}

	public List<String> obtenerGestiones() {
		return calificacionRepository.findAllByOrderByGestionAsc().stream()
				.map(CalificacionDocente::getGestion)
				.distinct()
				.collect(Collectors.toList());
	}

	public Optional<CalificacionDocentePromedioResponse> obtenerPromediosPorRango(
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

	private Optional<CalificacionDocentePromedioResponse> crearPromedios(
			Long idDocente,
			String gestionDesde,
			String gestionHasta,
			List<CalificacionDocente> calificaciones
	) {
		if (calificaciones.isEmpty()) {
			return Optional.empty();
		}

		return Optional.of(new CalificacionDocentePromedioResponse(
				idDocente,
				gestionDesde,
				gestionHasta,
				calificaciones.stream().mapToInt(CalificacionDocente::getClaridadExplicaciones).average().orElse(0),
				calificaciones.stream().mapToInt(CalificacionDocente::getMetodologia).average().orElse(0),
				calificaciones.stream().mapToInt(CalificacionDocente::getRelacionClasesEvaluaciones).average().orElse(0)
		));
	}
}
