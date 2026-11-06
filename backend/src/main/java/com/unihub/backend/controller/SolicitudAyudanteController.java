package com.unihub.backend.controller;

import com.unihub.backend.dto.ayudante.SolicitudAyudanteRequest;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.dto.ayudante.SolicitudAyudanteResponse;
import com.unihub.backend.service.SolicitudAyudanteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.unihub.backend.common.Constants.SolicitudAyudante.*;

@RestController
@RequestMapping
public class SolicitudAyudanteController {

    private final SolicitudAyudanteService solicitudAyudanteService;

    public SolicitudAyudanteController(SolicitudAyudanteService solicitudAyudanteService) {
        this.solicitudAyudanteService = solicitudAyudanteService;
    }

    @PostMapping(CREAR_URL)
    public ResponseEntity<SolicitudAyudanteResponse> solicitar(@Valid @RequestBody SolicitudAyudanteRequest request, @RequestAttribute(JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE) Long estudianteAutenticado) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitudAyudanteService.solicitar(request, estudianteAutenticado));
    }

    @GetMapping(POR_ESTUDIANTE_URL)
    public ResponseEntity<List<SolicitudAyudanteResponse>> obtenerPorEstudiante(@PathVariable Long idEstudiante, @RequestAttribute(JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE) Long estudianteAutenticado) {
        if (!idEstudiante.equals(estudianteAutenticado)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(solicitudAyudanteService.obtenerPorEstudiante(idEstudiante));
    }

    @GetMapping(POR_MATERIA_URL)
    public ResponseEntity<List<SolicitudAyudanteResponse>> obtenerPorMateria(@PathVariable Long idMateria) {
        return ResponseEntity.ok(solicitudAyudanteService.obtenerPorMateria(idMateria));
    }

    @GetMapping(PENDIENTES_URL)
    public ResponseEntity<List<SolicitudAyudanteResponse>> obtenerPendientes() {
        return ResponseEntity.ok(solicitudAyudanteService.obtenerPendientes());
    }

    @PostMapping(APROBAR_URL)
    public ResponseEntity<SolicitudAyudanteResponse> aprobar(@PathVariable Long idSolicitud) {
        return ResponseEntity.ok(solicitudAyudanteService.aprobar(idSolicitud));
    }

    @PostMapping(RECHAZAR_URL)
    public ResponseEntity<SolicitudAyudanteResponse> rechazar(@PathVariable Long idSolicitud) {
        return ResponseEntity.ok(solicitudAyudanteService.rechazar(idSolicitud));
    }

}
