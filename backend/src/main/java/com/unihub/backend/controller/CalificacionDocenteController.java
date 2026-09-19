package com.unihub.backend.controller;

import com.unihub.backend.dto.calificacion.CalificacionDocentePromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.dto.calificacion.CalificacionDocenteResponse;
import com.unihub.backend.service.CalificacionDocenteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/calificacion-docente")
public class CalificacionDocenteController {

    private final CalificacionDocenteService calificacionService;

    public CalificacionDocenteController(CalificacionDocenteService calificacionService) {
	this.calificacionService = calificacionService;
    }

    @PostMapping
    public ResponseEntity<CalificacionDocenteResponse> crear(
	    @Valid @RequestBody CalificacionDocenteRequest request
    ) {
	return ResponseEntity.status(HttpStatus.CREATED).body(calificacionService.crear(request));
    }

    @GetMapping("/docente/{idDocente}")
    public ResponseEntity<CalificacionDocentePromedioResponse> obtenerPromediosPorDocente(
	    @PathVariable Long idDocente
    ) {
	return calificacionService.obtenerPromediosPorDocente(idDocente)
		.map(ResponseEntity::ok)
		.orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/estudiante/{idEstudiante}/docente/{idDocente}")
    public ResponseEntity<CalificacionDocenteResponse> obtenerPorEstudiante(
	    @PathVariable Long idEstudiante,
	    @PathVariable Long idDocente
    ) {
	return ResponseEntity.ok(calificacionService.obtenerPorEstudiante(idEstudiante, idDocente).orElse(null));
    }

    @PutMapping("/estudiante/{idEstudiante}/docente/{idDocente}")
    public ResponseEntity<CalificacionDocenteResponse> actualizar(
	    @PathVariable Long idEstudiante,
	    @PathVariable Long idDocente,
	    @Valid @RequestBody CalificacionDocenteRequest request
    ) {
	return calificacionService.actualizar(idEstudiante, idDocente, request)
		.map(ResponseEntity::ok)
		.orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/estudiante/{idEstudiante}/docente/{idDocente}")
    public ResponseEntity<Void> eliminar(
	    @PathVariable Long idEstudiante,
	    @PathVariable Long idDocente
    ) {
	return calificacionService.eliminar(idEstudiante, idDocente)
		? ResponseEntity.noContent().build()
		: ResponseEntity.notFound().build();
    }

    @GetMapping("/periodo/{gestion}")
    public ResponseEntity<CalificacionDocentePromedioResponse> obtenerPromediosPorGestion(
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
    public ResponseEntity<CalificacionDocentePromedioResponse> obtenerPromediosPorRango(
	    @RequestParam String desde,
	    @RequestParam String hasta
    ) {
	return calificacionService.obtenerPromediosPorRango(desde, hasta)
		.map(ResponseEntity::ok)
		.orElseGet(() -> ResponseEntity.notFound().build());
    }
}
