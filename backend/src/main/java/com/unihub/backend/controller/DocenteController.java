package com.unihub.backend.controller;

import com.unihub.backend.dto.docente.DocenteRequest;
import com.unihub.backend.dto.docente.DocenteResponse;
import com.unihub.backend.service.DocenteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/docentes")
public class DocenteController {

	private final DocenteService docenteService;

	public DocenteController(DocenteService docenteService) {
		this.docenteService = docenteService;
	}

	@PostMapping
	public ResponseEntity<DocenteResponse> agregar(@Valid @RequestBody DocenteRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(docenteService.agregar(request));
	}

	@GetMapping("/materia/{idMateria}")
	public ResponseEntity<List<DocenteResponse>> obtenerPorMateria(@PathVariable Long idMateria) {
		return ResponseEntity.ok(docenteService.obtenerPorMateria(idMateria));
	}
}
