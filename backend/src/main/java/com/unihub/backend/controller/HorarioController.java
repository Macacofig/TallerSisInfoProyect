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

import static com.unihub.backend.common.Constants.Horario.GENERAR_URL;
import static com.unihub.backend.common.Constants.Horario.OBTENER_DATOS_URL;

@RestController
@RequestMapping
public class HorarioController {

    private final HorarioService horarioService;

    public HorarioController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    @PostMapping(OBTENER_DATOS_URL)
    public ResponseEntity<HorarioNormalizacionResponse> obtenerDatos(@RequestBody List<HorarioMateriaRequest> materiasCrudas) {
        return ResponseEntity.ok(horarioService.normalizarEntradaCruda(materiasCrudas));
    }

    @PostMapping(GENERAR_URL)
    public ResponseEntity<List<HorarioResponse2>> generarhorarios(@RequestBody HorarioGeneracionRequest request) {
        return ResponseEntity.ok(horarioService.generarDesdeSession(request));
    }
}
