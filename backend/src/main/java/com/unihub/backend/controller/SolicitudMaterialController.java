package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.dto.material.SolicitudMaterialResponse;
import com.unihub.backend.service.SolicitudMaterialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.unihub.backend.common.Constants.SolicitudMaterial.APROBAR_URL;
import static com.unihub.backend.common.Constants.SolicitudMaterial.ELIMINAR_URL;
import static com.unihub.backend.common.Constants.SolicitudMaterial.PENDIENTES_URL;
import static com.unihub.backend.common.Constants.SolicitudMaterial.RECHAZAR_URL;
import static com.unihub.backend.common.Constants.SolicitudMaterial.TODAS_URL;
import static com.unihub.backend.common.Constants.Estudiante.MIS_MATERIALES_URL;

@RestController
public class SolicitudMaterialController {

    private final SolicitudMaterialService solicitudMaterialService;

    public SolicitudMaterialController(SolicitudMaterialService solicitudMaterialService) {
        this.solicitudMaterialService = solicitudMaterialService;
    }

    @GetMapping(TODAS_URL)
    public ResponseEntity<List<SolicitudMaterialResponse>> obtenerTodas() {
        return ResponseEntity.ok(solicitudMaterialService.obtenerTodas());
    }

    @GetMapping(MIS_MATERIALES_URL)
    public ResponseEntity<List<SolicitudMaterialResponse>> obtenerMisMateriales(
            @RequestAttribute(JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE) Long estudianteAutenticado
    ) {
        return ResponseEntity.ok(solicitudMaterialService.obtenerPorEstudiante(estudianteAutenticado));
    }

    @GetMapping(PENDIENTES_URL)
    public ResponseEntity<List<SolicitudMaterialResponse>> obtenerPendientes() {
        return ResponseEntity.ok(solicitudMaterialService.obtenerPendientes());
    }

    @PostMapping(APROBAR_URL)
    public ResponseEntity<SolicitudMaterialResponse> aprobar(@PathVariable Long idSolicitud) {
        return ResponseEntity.ok(solicitudMaterialService.aprobar(idSolicitud));
    }

    @PostMapping(RECHAZAR_URL)
    public ResponseEntity<SolicitudMaterialResponse> rechazar(@PathVariable Long idSolicitud) {
        return ResponseEntity.ok(solicitudMaterialService.rechazar(idSolicitud));
    }

    @DeleteMapping(ELIMINAR_URL)
    public ResponseEntity<Void> eliminar(@PathVariable Long idSolicitud) {
        solicitudMaterialService.eliminar(idSolicitud);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
