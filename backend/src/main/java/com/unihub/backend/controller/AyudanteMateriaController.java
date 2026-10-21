package com.unihub.backend.controller;

import com.unihub.backend.dto.ayudante.AyudanteMateriaRequest;
import com.unihub.backend.dto.ayudante.AyudanteMateriaResponse;
import com.unihub.backend.service.AyudanteMateriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.unihub.backend.common.Constants.AyudanteMateria.*;

@RestController
@RequestMapping
public class AyudanteMateriaController {

    private final AyudanteMateriaService ayudanteMateriaService;

    public AyudanteMateriaController(AyudanteMateriaService ayudanteMateriaService) {
        this.ayudanteMateriaService = ayudanteMateriaService;
    }

    @PostMapping(CREAR_URL)
    public ResponseEntity<AyudanteMateriaResponse> crear(@Valid @RequestBody AyudanteMateriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ayudanteMateriaService.crear(request));
    }

    @GetMapping(POR_MATERIA_APROBADOS_URL)
    public ResponseEntity<List<AyudanteMateriaResponse>> obtenerAyudantesAprobadosPorMateria(@PathVariable Long idMateria) {
        return ResponseEntity.ok(ayudanteMateriaService.obtenerAyudantesAprobadosPorMateria(idMateria));
    }

    @DeleteMapping(DEJAR_URL)
    public ResponseEntity<Void> dejarDeSerAyudante(@PathVariable Long idAyudanteMateria, @PathVariable Long idEstudiante) {
        ayudanteMateriaService.dejarDeSerAyudante(idAyudanteMateria, idEstudiante);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(APROBAR_URL)
    public ResponseEntity<AyudanteMateriaResponse> aprobar(@PathVariable Long idAyudanteMateria) {
        return ResponseEntity.ok(ayudanteMateriaService.aprobarSolicitud(idAyudanteMateria));
    }

    @PostMapping(RECHAZAR_URL)
    public ResponseEntity<AyudanteMateriaResponse> rechazar(@PathVariable Long idAyudanteMateria) {
        return ResponseEntity.ok(ayudanteMateriaService.rechazarSolicitud(idAyudanteMateria));
    }

    @GetMapping(PENDIENTES_URL)
    public ResponseEntity<List<AyudanteMateriaResponse>> obtenerPendientes() {
        return ResponseEntity.ok(ayudanteMateriaService.obtenerSolicitudesPendientes());
    }
}