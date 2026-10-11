package com.unihub.backend.controller;

import com.unihub.backend.dto.docente.DocenteMateriaRequest;
import com.unihub.backend.dto.docente.DocenteMateriaResponse;
import com.unihub.backend.service.DocenteMateriaService;
import com.unihub.backend.service.CatalogAdminAuthorization;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import static com.unihub.backend.common.Constants.DocenteMateria.CREAR_URL;

@RestController
@RequestMapping
public class DocenteMateriaController {

    private final DocenteMateriaService docenteMateriaService;
    private final CatalogAdminAuthorization catalogAdminAuthorization;

    public DocenteMateriaController(
            DocenteMateriaService docenteMateriaService,
            CatalogAdminAuthorization catalogAdminAuthorization
    ) {
        this.docenteMateriaService = docenteMateriaService;
        this.catalogAdminAuthorization = catalogAdminAuthorization;
    }

    @PostMapping(CREAR_URL)
    public ResponseEntity<DocenteMateriaResponse> crear(
            @RequestHeader(value = "X-Catalog-Admin-Token", required = false) String adminToken,
            @Valid @RequestBody DocenteMateriaRequest request
    ) {
        catalogAdminAuthorization.requerirAdministrador(adminToken);
        return ResponseEntity.status(HttpStatus.CREATED).body(docenteMateriaService.crear(request));
    }
}
