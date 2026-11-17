package com.unihub.backend.controller;

import com.unihub.backend.dto.material.MaterialDescarga;
import com.unihub.backend.dto.material.MaterialRequest;
import com.unihub.backend.dto.material.MaterialResponse;
import com.unihub.backend.dto.material.MaterialSubidoResponse;
import com.unihub.backend.exception.BadRequestException;
import com.unihub.backend.service.MaterialService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static com.unihub.backend.common.Constants.Material.BASE;
import static com.unihub.backend.common.Constants.Material.DESCARGAR_URL;
import static com.unihub.backend.common.Constants.Material.POR_MATERIA_URL;
import static com.unihub.backend.common.Constants.Material.SUBIR_URL;

@RestController
@RequestMapping(BASE)
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping(DESCARGAR_URL)
    public ResponseEntity<byte[]> descargar(@PathVariable Long idMaterial) {
        MaterialDescarga descarga = materialService.descargar(idMaterial);
        MediaType contentType = MediaTypeFactory.getMediaType(descarga.nombreArchivo())
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(descarga.nombreArchivo(), StandardCharsets.UTF_8)
                                .build()
                                .toString())
                .body(descarga.contenido());
    }

    @GetMapping(POR_MATERIA_URL)
    public ResponseEntity<List<MaterialResponse>> obtenerPorMateria(
            @PathVariable Long idMateria,
            @RequestParam(value = "idDocente", required = false) Long idDocente,
            @RequestParam(value = "semestre", required = false) Integer semestre,
            @RequestParam(value = "tipo", required = false) String tipo
    ) {
        return ResponseEntity.ok(
                materialService.obtenerPorMateria(idMateria, idDocente, semestre, tipo));
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
