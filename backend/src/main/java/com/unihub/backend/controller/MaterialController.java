package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.dto.material.MaterialRequest;
import com.unihub.backend.dto.material.MaterialSubidoResponse;
import com.unihub.backend.exception.AccesoNoAutorizadoException;
import com.unihub.backend.service.MaterialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import static com.unihub.backend.common.Constants.Material.BASE;
import static com.unihub.backend.common.Constants.Material.SUBIR_URL;

@RestController
@RequestMapping(BASE)
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @PostMapping(value = SUBIR_URL, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaterialSubidoResponse> subirMaterialAcademico(
            @RequestPart("documento") MultipartFile documento,
            @RequestParam("titulo") String titulo,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("idMateria") Long idMateria,
            @RequestParam("idDocente") Long idDocente,
            @RequestParam(value = "semestreIngresado", required = false) Integer semestreIngresado,
            @RequestParam(value = "idEstudiante", required = false) Long idEstudiante,
            @RequestAttribute(JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE) Long estudianteAutenticado
    ) {
        if (idEstudiante != null && !idEstudiante.equals(estudianteAutenticado)) {
            throw new AccesoNoAutorizadoException(
                    "No puedes subir material a nombre de otro estudiante");
        }

        MaterialRequest request = new MaterialRequest(
                titulo,
                descripcion,
                idMateria,
                idDocente,
                semestreIngresado
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(materialService.subirMaterialAcademico(request, documento, estudianteAutenticado));
    }
}
