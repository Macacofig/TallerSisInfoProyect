package com.unihub.backend.controller;

import com.unihub.backend.dto.material.MaterialRequest;
import com.unihub.backend.dto.material.MaterialResponse;
import com.unihub.backend.dto.material.MaterialSubidoResponse;
import com.unihub.backend.exception.BadRequestException;
import com.unihub.backend.service.MaterialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static com.unihub.backend.common.Constants.Material.BASE;
import static com.unihub.backend.common.Constants.Material.POR_MATERIA_URL;
import static com.unihub.backend.common.Constants.Material.SUBIR_URL;

@RestController
@RequestMapping(BASE)
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping(POR_MATERIA_URL)
    public ResponseEntity<List<MaterialResponse>> obtenerPorMateria(@PathVariable Long idMateria) {
        return ResponseEntity.ok(materialService.obtenerPorMateria(idMateria));
    }

    @PostMapping(value = SUBIR_URL, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaterialSubidoResponse> subirMaterialAcademico(
            @RequestPart("documento") MultipartFile documento,
            @RequestParam("titulo") String titulo,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("idMateria") Long idMateria,
            @RequestParam("idDocente") Long idDocente,
            @RequestParam(value = "semestreIngresado", required = false) Integer semestreIngresado,
            @RequestParam(value = "idEstudiante", required = false) Long idEstudiante
    ) {
        if (idEstudiante == null) {
            throw new BadRequestException("El estudiante es obligatorio");
        }

        MaterialRequest request = new MaterialRequest(
                titulo,
                descripcion,
                idMateria,
                idDocente,
                semestreIngresado
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(materialService.subirMaterialAcademico(request, documento, idEstudiante));
    }
}
