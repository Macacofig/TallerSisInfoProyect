package com.unihub.backend.controller;

import com.unihub.backend.dto.materia.MateriaResponse;
import com.unihub.backend.service.MateriaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/materias")
public class MateriaController {

    private final MateriaService materiaService;

    public MateriaController(MateriaService materiaService) {
        this.materiaService = materiaService;
    }

    @GetMapping
    public List<MateriaResponse> obtenerMaterias() {

        return materiaService.obtenerMaterias();
    }
}