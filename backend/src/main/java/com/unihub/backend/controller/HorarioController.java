package com.unihub.backend.controller;

import com.unihub.backend.dto.horario.HorarioGeneracionRequest;
import com.unihub.backend.dto.horario.HorarioMateriaRequest;
import com.unihub.backend.dto.horario.HorarioNormalizacionResponse;
import com.unihub.backend.dto.horario.HorarioResponse2;
import com.unihub.backend.service.HorarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/horarios")
public class HorarioController {

    private final HorarioService horarioService;

    public HorarioController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    @PostMapping("/obtenerDatos")
    public ResponseEntity<HorarioNormalizacionResponse> obtenerDatos(@RequestBody List<HorarioMateriaRequest> materiasCrudas) {
        return ResponseEntity.ok(horarioService.normalizarEntradaCruda(materiasCrudas));
    }

    @PostMapping("/generarhorarios")
    public ResponseEntity<List<HorarioResponse2>> generarhorarios(@RequestBody HorarioGeneracionRequest request) {
        return ResponseEntity.ok(horarioService.generarDesdeSession(request));
    }
}
