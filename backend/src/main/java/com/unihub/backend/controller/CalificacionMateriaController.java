package com.unihub.backend.controller;

import com.unihub.backend.dto.calificacion.CalificacionMateriaRequest;
import com.unihub.backend.dto.calificacion.CalificacionMateriaResponse;
import com.unihub.backend.service.CalificacionMateriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
