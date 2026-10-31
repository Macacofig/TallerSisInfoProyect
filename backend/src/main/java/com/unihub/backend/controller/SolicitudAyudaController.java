package com.unihub.backend.controller;

import com.unihub.backend.dto.ayudante.SolicitudAyudaRequest;
import com.unihub.backend.dto.ayudante.SolicitudAyudaResponse;
import com.unihub.backend.service.SolicitudAyudaService;
import com.unihub.backend.service.JwtService;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.unihub.backend.common.Constants.SolicitudAyuda.*;

@RestController
@RequestMapping
public class SolicitudAyudaController {

    private final SolicitudAyudaService solicitudAyudaService;
    private final JwtService jwtService;

    public SolicitudAyudaController(SolicitudAyudaService solicitudAyudaService, JwtService jwtService) {
        this.solicitudAyudaService = solicitudAyudaService;
        this.jwtService = jwtService;
    }

    @PostMapping(CREAR_URL)
    public ResponseEntity<SolicitudAyudaResponse> solicitarAyuda(
            @RequestAttribute(value = JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE, required = false) Long authenticatedStudentId,
            @Valid @RequestBody SolicitudAyudaRequest request) {
        jwtService.verificarPropiedad(authenticatedStudentId, request.idEstudiante());
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitudAyudaService.solicitarAyuda(request));
    }

    @GetMapping(POR_AYUDANTE_URL)
    public ResponseEntity<List<SolicitudAyudaResponse>> obtenerPorAyudante(@PathVariable Long idAyudante) {
        return ResponseEntity.ok(solicitudAyudaService.obtenerPorAyudante(idAyudante));
    }

    @GetMapping(PENDIENTES_POR_AYUDANTE_URL)
    public ResponseEntity<List<SolicitudAyudaResponse>> obtenerPendientesPorAyudante(@PathVariable Long idAyudante) {
        return ResponseEntity.ok(solicitudAyudaService.obtenerPendientesPorAyudante(idAyudante));
    }

    @GetMapping(POR_ESTUDIANTE_URL)
    public ResponseEntity<List<SolicitudAyudaResponse>> obtenerPorEstudiante(@PathVariable Long idEstudiante) {
        return ResponseEntity.ok(solicitudAyudaService.obtenerPorEstudiante(idEstudiante));
    }

    @PostMapping(RESOLVER_URL)
    public ResponseEntity<SolicitudAyudaResponse> resolver(@PathVariable Long idSolicitud) {
        return ResponseEntity.ok(solicitudAyudaService.resolver(idSolicitud));
    }

    @PostMapping(CANCELAR_URL)
    public ResponseEntity<SolicitudAyudaResponse> cancelar(@PathVariable Long idSolicitud, @PathVariable Long idEstudiante) {
        return ResponseEntity.ok(solicitudAyudaService.cancelar(idSolicitud, idEstudiante));
    }
}
