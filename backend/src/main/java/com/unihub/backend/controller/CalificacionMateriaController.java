package com.unihub.backend.controller;

import com.unihub.backend.dto.calificacion.CalificacionMateriaRequest;
import com.unihub.backend.dto.calificacion.CalificacionMateriaPromedioMateriaResponse;
import com.unihub.backend.dto.calificacion.CalificacionMateriaPromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionMateriaResponse;
import com.unihub.backend.service.CalificacionMateriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.unihub.backend.common.Constants.CalificacionMateria.ACTUALIZAR_URL;
import static com.unihub.backend.common.Constants.CalificacionMateria.CREAR_URL;
import static com.unihub.backend.common.Constants.CalificacionMateria.ELIMINAR_URL;
import static com.unihub.backend.common.Constants.CalificacionMateria.GESTIONES_URL;
import static com.unihub.backend.common.Constants.CalificacionMateria.OBTENER_POR_ESTUDIANTE_URL;
import static com.unihub.backend.common.Constants.CalificacionMateria.PROMEDIOS_MATERIAS_URL;
import static com.unihub.backend.common.Constants.CalificacionMateria.PROMEDIOS_POR_GESTION_URL;
import static com.unihub.backend.common.Constants.CalificacionMateria.PROMEDIOS_POR_MATERIA_URL;
import static com.unihub.backend.common.Constants.CalificacionMateria.PROMEDIOS_POR_RANGO_URL;

@RestController
@RequestMapping
public class CalificacionMateriaController {

	private final CalificacionMateriaService calificacionService;

	public CalificacionMateriaController(CalificacionMateriaService calificacionService) {
		this.calificacionService = calificacionService;
	}

	@PostMapping(CREAR_URL)
	public ResponseEntity<CalificacionMateriaResponse> crear(
			@Valid @RequestBody CalificacionMateriaRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(calificacionService.crear(request));
	}

	@GetMapping(PROMEDIOS_POR_MATERIA_URL)
	public ResponseEntity<CalificacionMateriaPromedioResponse> obtenerPromediosPorMateria(
			@PathVariable Long idMateria
	) {
		return calificacionService.obtenerPromediosPorMateria(idMateria)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@GetMapping(PROMEDIOS_MATERIAS_URL)
	public ResponseEntity<List<CalificacionMateriaPromedioMateriaResponse>> obtenerPromediosMaterias() {
		return ResponseEntity.ok(calificacionService.obtenerPromediosMaterias());
	}

	@GetMapping(OBTENER_POR_ESTUDIANTE_URL)
	public ResponseEntity<CalificacionMateriaResponse> obtenerPorEstudiante(
			@PathVariable Long idEstudiante,
			@PathVariable Long idMateria
	) {
		return ResponseEntity.ok(calificacionService.obtenerPorEstudiante(idEstudiante, idMateria).orElse(null));
	}

	@PutMapping(ACTUALIZAR_URL)
	public ResponseEntity<CalificacionMateriaResponse> actualizar(
			@PathVariable Long idEstudiante,
			@PathVariable Long idMateria,
			@Valid @RequestBody CalificacionMateriaRequest request
	) {
		return calificacionService.actualizar(idEstudiante, idMateria, request)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping(ELIMINAR_URL)
	public ResponseEntity<Void> eliminar(
			@PathVariable Long idEstudiante,
			@PathVariable Long idMateria
	) {
		return calificacionService.eliminar(idEstudiante, idMateria)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}

	@GetMapping(PROMEDIOS_POR_GESTION_URL)
	public ResponseEntity<CalificacionMateriaPromedioResponse> obtenerPromediosPorGestion(
			@PathVariable String gestion
	) {
		return calificacionService.obtenerPromediosPorGestion(gestion)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@GetMapping(GESTIONES_URL)
	public ResponseEntity<List<String>> obtenerGestiones() {
		return ResponseEntity.ok(calificacionService.obtenerGestiones());
	}

	@GetMapping(PROMEDIOS_POR_RANGO_URL)
	public ResponseEntity<CalificacionMateriaPromedioResponse> obtenerPromediosPorRango(
			@RequestParam String desde,
			@RequestParam String hasta
	) {
		return calificacionService.obtenerPromediosPorRango(desde, hasta)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}
}
