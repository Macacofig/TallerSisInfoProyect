package com.unihub.backend.controller;

import com.unihub.backend.dto.docente.DocenteMateriaRequest;
import com.unihub.backend.dto.docente.DocenteMateriaResponse;
import com.unihub.backend.service.DocenteMateriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docente-materia")
public class DocenteMateriaController {

    private final DocenteMateriaService docenteMateriaService;

    public DocenteMateriaController(DocenteMateriaService docenteMateriaService) {
        this.docenteMateriaService = docenteMateriaService;
    }

    @PostMapping
    public ResponseEntity<DocenteMateriaResponse> crear(
            @Valid @RequestBody DocenteMateriaRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(docenteMateriaService.crear(request));
    }
}