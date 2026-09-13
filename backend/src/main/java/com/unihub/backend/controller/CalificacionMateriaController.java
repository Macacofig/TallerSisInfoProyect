package com.unihub.backend.controller;

import com.unihub.backend.dto.calificacion.CalificacionMateriaRequest;
import com.unihub.backend.dto.calificacion.CalificacionMateriaPromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionMateriaResponse;
import com.unihub.backend.service.CalificacionMateriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/calificacion-materia")
public class CalificacionMateriaController {

	private final CalificacionMateriaService calificacionService;

	public CalificacionMateriaController(CalificacionMateriaService calificacionService) {
		this.calificacionService = calificacionService;
	}

	@PostMapping
	public ResponseEntity<CalificacionMateriaResponse> crear(
			@Valid @RequestBody CalificacionMateriaRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(calificacionService.crear(request));
	}

	@GetMapping("/materia/{idMateria}")
	public ResponseEntity<CalificacionMateriaPromedioResponse> obtenerPromediosPorMateria(
			@PathVariable Long idMateria
	) {
		return calificacionService.obtenerPromediosPorMateria(idMateria)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@GetMapping("/estudiante/{idEstudiante}/materia/{idMateria}")
	public ResponseEntity<CalificacionMateriaResponse> obtenerPorEstudiante(
			@PathVariable Long idEstudiante,
			@PathVariable Long idMateria
	) {
		return ResponseEntity.ok(calificacionService.obtenerPorEstudiante(idEstudiante, idMateria).orElse(null));
	}

	@GetMapping("/periodo/{gestion}")
	public ResponseEntity<CalificacionMateriaPromedioResponse> obtenerPromediosPorGestion(
			@PathVariable String gestion
	) {
		return calificacionService.obtenerPromediosPorGestion(gestion)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

	@GetMapping("/gestiones")
	public ResponseEntity<List<String>> obtenerGestiones() {
		return ResponseEntity.ok(calificacionService.obtenerGestiones());
	}

	@GetMapping("/periodo/rango")
	public ResponseEntity<CalificacionMateriaPromedioResponse> obtenerPromediosPorRango(
			@RequestParam String desde,
			@RequestParam String hasta
	) {
		return calificacionService.obtenerPromediosPorRango(desde, hasta)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}
}
