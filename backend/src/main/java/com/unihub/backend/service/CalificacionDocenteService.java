package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.calificacion.CalificacionDocenteGestionResumenResponse;
import com.unihub.backend.dto.calificacion.CalificacionDocentePromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.dto.calificacion.CalificacionDocenteResponse;
import com.unihub.backend.entity.CalificacionDocente;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.exception.CalificacionDocenteDuplicadaException;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.CalificacionDocenteMapper;
import com.unihub.backend.repository.CalificacionDocenteRepository;
import com.unihub.backend.repository.DocenteRepository;
import com.unihub.backend.repository.DocenteMateriaRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.util.GestionAcademica;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
public class CalificacionDocenteService {

	private final CalificacionDocenteRepository calificacionRepository;
	private final DocenteRepository docenteRepository;
	private final CalificacionDocenteMapper calificacionMapper;
	private final DocenteMateriaRepository docenteMateriaRepository;
	private final MateriaRepository materiaRepository;
	private final EstudianteRepository estudianteRepository;
	private final ActividadEstudianteService actividadEstudianteService;

	public CalificacionDocenteService(
			CalificacionDocenteRepository calificacionRepository,
			DocenteRepository docenteRepository,
			CalificacionDocenteMapper calificacionMapper,
			DocenteMateriaRepository docenteMateriaRepository,
			MateriaRepository materiaRepository,
			EstudianteRepository estudianteRepository,
			ActividadEstudianteService actividadEstudianteService
	) {
		this.calificacionRepository = calificacionRepository;
		this.docenteRepository = docenteRepository;
		this.calificacionMapper = calificacionMapper;
		this.docenteMateriaRepository = docenteMateriaRepository;
		this.materiaRepository = materiaRepository;
		this.estudianteRepository = estudianteRepository;
		this.actividadEstudianteService = actividadEstudianteService;
	}

	@Transactional
	public CalificacionDocenteResponse crear(CalificacionDocenteRequest request) {
		Docente docente = docenteRepository.findById(request.idDocente())
				.orElseThrow(() -> new IllegalArgumentException("El docente no existe"));
		Materia materia = materiaRepository.findById(request.idMateria())
				.orElseThrow(() -> new IllegalArgumentException("La materia no existe"));
		if (!docenteMateriaRepository.existsByDocenteIdAndMateriaId(request.idDocente(), request.idMateria())) {
			throw new IllegalArgumentException("El docente no pertenece a la materia");
		}
		Estudiante estudiante = request.idEstudiante() == null
				? null
				: estudianteRepository.findById(request.idEstudiante())
						.orElseThrow(() -> new IllegalArgumentException("El estudiante no existe"));

		Optional<CalificacionDocente> existente = calificacionRepository
				.findFirstByEstudiante_IdAndDocenteIdAndMateriaId(
						request.idEstudiante(), request.idDocente(), request.idMateria());
		if (existente.isPresent()) {
			throw new CalificacionDocenteDuplicadaException();
		}

		CalificacionDocente calificacion = calificacionMapper.toEntity(request, docente, materia, estudiante);
		CalificacionDocenteResponse response = calificacionMapper.toResponse(calificacionRepository.save(calificacion));
		actividadEstudianteService.registrarCalificacionDocente(estudiante, docente, materia);
		LogHelper.info(CalificacionDocenteService.class, "Calificación docente creada correctamente");
		return response;
	}

	public List<CalificacionDocentePromedioResponse> obtenerPromediosPorMateria(Long idMateria) {
		return obtenerPromediosAgrupados(idMateria, null, null,
				calificacionRepository.findByMateriaId(idMateria));
	}

	public Optional<CalificacionDocenteResponse> obtenerPorEstudiante(Long idEstudiante, Long idDocente, Long idMateria) {
		return calificacionRepository.findFirstByEstudiante_IdAndDocenteIdAndMateriaId(idEstudiante, idDocente, idMateria)
				.map(calificacionMapper::toResponse);
	}

	public Optional<CalificacionDocenteResponse> actualizar(
			Long idEstudiante,
			Long idDocente,
			Long idMateria,
			CalificacionDocenteRequest request
	) {
		return calificacionRepository.findFirstByEstudiante_IdAndDocenteIdAndMateriaId(
				idEstudiante, idDocente, idMateria)
				.map(calificacion -> {
					calificacionMapper.actualizar(calificacion, request);
					CalificacionDocenteResponse response = calificacionMapper.toResponse(calificacionRepository.save(calificacion));
					LogHelper.info(CalificacionDocenteService.class, "Calificación docente actualizada correctamente");
					return response;
				});
	}

	public boolean eliminar(Long idEstudiante, Long idDocente, Long idMateria) {
		return calificacionRepository.findFirstByEstudiante_IdAndDocenteIdAndMateriaId(
				idEstudiante, idDocente, idMateria)
				.map(calificacion -> {
					calificacionRepository.delete(calificacion);
					LogHelper.info(CalificacionDocenteService.class, "Calificación docente eliminada correctamente");
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

	@Transactional(readOnly = true)
	public List<CalificacionDocenteGestionResumenResponse> obtenerHistorialGestiones(Long idMateria) {
		Map<GestionAcademica, GestionAcumulada> porGestion = new LinkedHashMap<>();
		calificacionRepository.findByMateriaId(idMateria).forEach(calificacion -> {
			GestionAcademica gestion = GestionAcademica.normalizar(calificacion.getGestion());
			porGestion.computeIfAbsent(gestion, GestionAcumulada::new).agregar(calificacion);
		});

		return porGestion.values().stream()
				.sorted((primera, segunda) -> primera.gestion.compareTo(segunda.gestion))
				.map(GestionAcumulada::toResponse)
				.toList();
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

	private static final class GestionAcumulada {
		private final GestionAcademica gestion;
		private final Set<String> gestionesOriginales = new TreeSet<>();
		private final Map<Long, DocenteAcumulado> docentes = new LinkedHashMap<>();

		private GestionAcumulada(GestionAcademica gestion) {
			this.gestion = gestion;
		}

		private void agregar(CalificacionDocente calificacion) {
			gestionesOriginales.add(calificacion.getGestion());
			Docente docente = calificacion.getDocente();
			docentes.computeIfAbsent(docente.getId(), ignored -> new DocenteAcumulado(docente))
					.agregar(calificacion);
		}

		private CalificacionDocenteGestionResumenResponse toResponse() {
			List<CalificacionDocenteGestionResumenResponse.DocenteResumen> resumenesDocentes =
					docentes.values().stream().map(DocenteAcumulado::toResponse).toList();
			long cantidadEvaluaciones = resumenesDocentes.stream()
					.mapToLong(CalificacionDocenteGestionResumenResponse.DocenteResumen::cantidadEvaluaciones)
					.sum();
			return new CalificacionDocenteGestionResumenResponse(
					gestion.gestion(),
					gestion.anio(),
					gestion.semestre(),
					List.copyOf(gestionesOriginales),
					cantidadEvaluaciones,
					resumenesDocentes
			);
		}
	}

	private static final class DocenteAcumulado {
		private final Docente docente;
		private long cantidadEvaluaciones;
		private double claridad;
		private double metodologia;
		private double relacion;

		private DocenteAcumulado(Docente docente) {
			this.docente = docente;
		}

		private void agregar(CalificacionDocente calificacion) {
			cantidadEvaluaciones++;
			claridad += calificacion.getClaridadExplicaciones();
			metodologia += calificacion.getMetodologia();
			relacion += calificacion.getRelacionClasesEvaluaciones();
		}

		private CalificacionDocenteGestionResumenResponse.DocenteResumen toResponse() {
			return new CalificacionDocenteGestionResumenResponse.DocenteResumen(
					docente.getId(),
					docente.getNombre(),
					cantidadEvaluaciones,
					claridad / cantidadEvaluaciones,
					metodologia / cantidadEvaluaciones,
					relacion / cantidadEvaluaciones
			);
		}
	}
}
