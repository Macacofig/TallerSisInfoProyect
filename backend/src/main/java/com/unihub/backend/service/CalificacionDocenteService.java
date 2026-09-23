package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionDocentePromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.dto.calificacion.CalificacionDocenteResponse;
import com.unihub.backend.entity.CalificacionDocente;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.CalificacionDocenteMapper;
import com.unihub.backend.repository.CalificacionDocenteRepository;
import com.unihub.backend.repository.DocenteRepository;
import com.unihub.backend.repository.DocenteMateriaRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CalificacionDocenteService {

	private final CalificacionDocenteRepository calificacionRepository;
	private final DocenteRepository docenteRepository;
	private final CalificacionDocenteMapper calificacionMapper;
	private final DocenteMateriaRepository docenteMateriaRepository;
	private final MateriaRepository materiaRepository;

	public CalificacionDocenteService(
			CalificacionDocenteRepository calificacionRepository,
			DocenteRepository docenteRepository,
			CalificacionDocenteMapper calificacionMapper,
			DocenteMateriaRepository docenteMateriaRepository,
			MateriaRepository materiaRepository
	) {
		this.calificacionRepository = calificacionRepository;
		this.docenteRepository = docenteRepository;
		this.calificacionMapper = calificacionMapper;
		this.docenteMateriaRepository = docenteMateriaRepository;
		this.materiaRepository = materiaRepository;
	}

	public CalificacionDocenteResponse crear(CalificacionDocenteRequest request) {
		Docente docente = docenteRepository.findById(request.idDocente())
				.orElseThrow(() -> new IllegalArgumentException("El docente no existe"));
		Materia materia = materiaRepository.findById(request.idMateria())
				.orElseThrow(() -> new IllegalArgumentException("La materia no existe"));
		if (!docenteMateriaRepository.existsByDocenteIdAndMateriaId(request.idDocente(), request.idMateria())) {
			throw new IllegalArgumentException("El docente no pertenece a la materia");
		}

		Optional<CalificacionDocente> existente = calificacionRepository
				.findFirstByIdEstudianteAndDocenteIdAndMateriaId(
						request.idEstudiante(), request.idDocente(), request.idMateria());
		if (existente.isPresent()) {
			throw new IllegalArgumentException("El estudiante ya calificó a este docente");
		}

		CalificacionDocente calificacion = calificacionMapper.toEntity(request, docente, materia);
		return calificacionMapper.toResponse(calificacionRepository.save(calificacion));
	}

	public List<CalificacionDocentePromedioResponse> obtenerPromediosPorMateria(Long idMateria) {
		return obtenerPromediosAgrupados(idMateria, null, null,
				calificacionRepository.findByMateriaId(idMateria));
	}

	public Optional<CalificacionDocenteResponse> obtenerPorEstudiante(Long idEstudiante, Long idDocente, Long idMateria) {
		return calificacionRepository.findFirstByIdEstudianteAndDocenteIdAndMateriaId(idEstudiante, idDocente, idMateria)
				.map(calificacionMapper::toResponse);
	}

	public Optional<CalificacionDocenteResponse> actualizar(
			Long idEstudiante,
			Long idDocente,
			Long idMateria,
			CalificacionDocenteRequest request
	) {
		return calificacionRepository.findFirstByIdEstudianteAndDocenteIdAndMateriaId(
				idEstudiante, idDocente, idMateria)
				.map(calificacion -> {
					calificacionMapper.actualizar(calificacion, request);
					return calificacionMapper.toResponse(calificacionRepository.save(calificacion));
				});
	}

	public boolean eliminar(Long idEstudiante, Long idDocente, Long idMateria) {
		return calificacionRepository.findFirstByIdEstudianteAndDocenteIdAndMateriaId(
				idEstudiante, idDocente, idMateria)
				.map(calificacion -> {
					calificacionRepository.delete(calificacion);
					return true;
				})
				.orElse(false);
	}

	public List<CalificacionDocentePromedioResponse> obtenerPromediosPorMateriaYGestion(Long idMateria, String gestion) {
		return obtenerPromediosAgrupados(idMateria, gestion, gestion,
				calificacionRepository.findByMateriaIdAndGestion(idMateria, gestion));
	}

	public List<String> obtenerGestiones(Long idMateria) {
		return calificacionRepository.findByMateriaIdOrderByGestionAsc(idMateria).stream()
				.map(CalificacionDocente::getGestion).distinct().collect(Collectors.toList());
	}

	public List<CalificacionDocentePromedioResponse> obtenerPromediosPorMateriaYRango(Long idMateria,
			String gestionDesde, String gestionHasta) {
		return obtenerPromediosAgrupados(idMateria, gestionDesde, gestionHasta,
				calificacionRepository.findByMateriaIdAndGestionBetween(idMateria, gestionDesde, gestionHasta));
	}

	private List<CalificacionDocentePromedioResponse> obtenerPromediosAgrupados(
			Long idMateria,
			String gestionDesde,
			String gestionHasta,
			List<CalificacionDocente> calificaciones
	) {
		Map<Long, List<CalificacionDocente>> porDocente = new LinkedHashMap<>();
		calificaciones.forEach(calificacion -> porDocente
				.computeIfAbsent(calificacion.getDocente().getId(), ignored -> new ArrayList<>())
				.add(calificacion));

		return porDocente.entrySet().stream()
			.map(entry -> crearPromedios(
					entry.getKey(), idMateria, gestionDesde, gestionHasta, entry.getValue()).orElseThrow())
			.toList();
	}

	private Optional<CalificacionDocentePromedioResponse> crearPromedios(
			Long idDocente,
			Long idMateria,
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
				calificaciones.stream().mapToInt(CalificacionDocente::getRelacionClasesEvaluaciones).average().orElse(0),
				idMateria,
				calificaciones.get(0).getDocente().getNombre()
		));
	}
}
