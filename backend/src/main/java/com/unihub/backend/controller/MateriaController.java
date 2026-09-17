package com.unihub.backend.controller;

import com.unihub.backend.dto.materia.MateriaResponse;
import com.unihub.backend.service.MateriaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/api/materias")
public class MateriaController {

    private final MateriaService materiaService;

    public MateriaController(MateriaService materiaService) {
        this.materiaService = materiaService;
    }

    @GetMapping("/carreras")
    public ResponseEntity<List<String>> obtenerCarreras() {
        return ResponseEntity.ok(materiaService.obtenerCarreras());
    }

    @GetMapping
    public ResponseEntity<List<MateriaResponse>> obtenerMaterias(

        @RequestParam(required = false) String nombre,

        @RequestParam(required = false) String carrera,

        @RequestParam(required = false) Integer semestre

    ) {

        List<MateriaResponse> materias =
            materiaService.obtenerMaterias(
                nombre,
                carrera,
                semestre
            );

        return ResponseEntity.ok(materias);
    }
}