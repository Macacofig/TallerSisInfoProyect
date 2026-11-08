package com.unihub.backend.controller;

import com.unihub.backend.dto.actividad.ActividadEstudianteActualizacionRequest;
import com.unihub.backend.dto.actividad.ActividadEstudianteRequest;
import com.unihub.backend.dto.actividad.ActividadEstudianteResponse;
import com.unihub.backend.service.ActividadEstudianteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.unihub.backend.common.Constants.ActividadEstudiante.ACTUALIZAR_URL;
import static com.unihub.backend.common.Constants.ActividadEstudiante.INSERTAR_URL;
import static com.unihub.backend.common.Constants.ActividadEstudiante.POR_ESTUDIANTE_URL;

@RestController
@RequestMapping
public class ActividadEstudianteController {

    private final ActividadEstudianteService actividadEstudianteService;

    public ActividadEstudianteController(ActividadEstudianteService actividadEstudianteService) {
        this.actividadEstudianteService = actividadEstudianteService;
    }

    @PostMapping(INSERTAR_URL)
    public ResponseEntity<ActividadEstudianteResponse> insertar(
            @Valid @RequestBody ActividadEstudianteRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(actividadEstudianteService.insertar(request));
    }

    @PutMapping(ACTUALIZAR_URL)
    public ResponseEntity<ActividadEstudianteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActividadEstudianteActualizacionRequest request
    ) {
        return ResponseEntity.ok(actividadEstudianteService.actualizar(id, request));
    }

    @GetMapping(POR_ESTUDIANTE_URL)
    public ResponseEntity<List<ActividadEstudianteResponse>> obtenerPorEstudiante(
            @PathVariable Long idEstudiante
    ) {
        return ResponseEntity.ok(actividadEstudianteService.obtenerPorEstudiante(idEstudiante));
    }
}
