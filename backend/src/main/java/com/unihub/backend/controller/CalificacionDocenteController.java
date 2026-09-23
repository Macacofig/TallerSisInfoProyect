package com.unihub.backend.controller;

import com.unihub.backend.dto.calificacion.CalificacionDocentePromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.dto.calificacion.CalificacionDocenteResponse;
import com.unihub.backend.service.CalificacionDocenteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.unihub.backend.common.Constants.CalificacionDocente.ACTUALIZAR_URL;
import static com.unihub.backend.common.Constants.CalificacionDocente.CREAR_URL;
import static com.unihub.backend.common.Constants.CalificacionDocente.ELIMINAR_URL;
import static com.unihub.backend.common.Constants.CalificacionDocente.GESTIONES_POR_MATERIA_URL;
import static com.unihub.backend.common.Constants.CalificacionDocente.OBTENER_POR_ESTUDIANTE_URL;
import static com.unihub.backend.common.Constants.CalificacionDocente.PROMEDIOS_POR_GESTION_URL;
import static com.unihub.backend.common.Constants.CalificacionDocente.PROMEDIOS_POR_MATERIA_URL;
import static com.unihub.backend.common.Constants.CalificacionDocente.PROMEDIOS_POR_RANGO_URL;

@RestController
@RequestMapping
public class CalificacionDocenteController {

    private final CalificacionDocenteService calificacionService;

    public CalificacionDocenteController(CalificacionDocenteService calificacionService) {
	this.calificacionService = calificacionService;
    }

    @PostMapping(CREAR_URL)
    public ResponseEntity<CalificacionDocenteResponse> crear(
	    @Valid @RequestBody CalificacionDocenteRequest request
    ) {
	return ResponseEntity.status(HttpStatus.CREATED).body(calificacionService.crear(request));
    }

    @GetMapping(PROMEDIOS_POR_MATERIA_URL)
    public ResponseEntity<List<CalificacionDocentePromedioResponse>> obtenerPromediosPorMateria(
            @PathVariable Long idMateria
    ) {
        return ResponseEntity.ok(calificacionService.obtenerPromediosPorMateria(idMateria));
    }

    @GetMapping(OBTENER_POR_ESTUDIANTE_URL)
        public ResponseEntity<CalificacionDocenteResponse> obtenerPorEstudianteEnMateria(
            @PathVariable Long idEstudiante,
            @PathVariable Long idDocente,
            @PathVariable Long idMateria
        ) {
        return ResponseEntity.ok(calificacionService
            .obtenerPorEstudiante(idEstudiante, idDocente, idMateria).orElse(null));
        }

    @PutMapping(ACTUALIZAR_URL)
        public ResponseEntity<CalificacionDocenteResponse> actualizarEnMateria(
            @PathVariable Long idEstudiante,
            @PathVariable Long idDocente,
            @PathVariable Long idMateria,
            @Valid @RequestBody CalificacionDocenteRequest request
        ) {
        return calificacionService.actualizar(idEstudiante, idDocente, idMateria, request)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
        }

    @DeleteMapping(ELIMINAR_URL)
        public ResponseEntity<Void> eliminarEnMateria(
            @PathVariable Long idEstudiante,
            @PathVariable Long idDocente,
            @PathVariable Long idMateria
        ) {
        return calificacionService.eliminar(idEstudiante, idDocente, idMateria)
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
        }

    @GetMapping(PROMEDIOS_POR_GESTION_URL)
        public ResponseEntity<List<CalificacionDocentePromedioResponse>> obtenerPromediosPorMateriaYGestion(
            @PathVariable Long idMateria,
            @PathVariable String gestion
        ) {
        return ResponseEntity.ok(calificacionService.obtenerPromediosPorMateriaYGestion(idMateria, gestion));
        }

    @GetMapping(GESTIONES_POR_MATERIA_URL)
    public ResponseEntity<List<String>> obtenerGestionesPorMateria(@PathVariable Long idMateria) {
        return ResponseEntity.ok(calificacionService.obtenerGestiones(idMateria));
    }

        @GetMapping(PROMEDIOS_POR_RANGO_URL)
        public ResponseEntity<List<CalificacionDocentePromedioResponse>> obtenerPromediosPorMateriaYRango(
            @PathVariable Long idMateria,
            @RequestParam String desde,
            @RequestParam String hasta
    ) {
        return ResponseEntity.ok(calificacionService.obtenerPromediosPorMateriaYRango(idMateria, desde, hasta));
    }
}
