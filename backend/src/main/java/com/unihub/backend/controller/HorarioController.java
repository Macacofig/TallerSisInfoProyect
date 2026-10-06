package com.unihub.backend.controller;

import com.unihub.backend.dto.horario.HorarioRequest;
import com.unihub.backend.dto.horario.HorarioResponse;
import com.unihub.backend.service.HorarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/horarios")
public class HorarioController {

    private final HorarioService horarioService;

    public HorarioController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    @PostMapping
    public ResponseEntity<HorarioResponse> generar(@Valid @RequestBody HorarioRequest request) {
        return ResponseEntity.ok(horarioService.generar(request));
    }
}
