package com.unihub.backend.controller;

import com.unihub.backend.dto.estudiante.EstudianteLoginRequest;
import com.unihub.backend.dto.estudiante.EstudianteLoginResponse;
import com.unihub.backend.dto.estudiante.EstudianteActualizacionRequest;
import com.unihub.backend.dto.estudiante.EstudianteRequest;
import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.service.EstudianteService;
import com.unihub.backend.service.JwtService;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.unihub.backend.common.Constants.Estudiante.ACTUALIZAR_URL;
import static com.unihub.backend.common.Constants.Estudiante.LOGIN_URL;
import static com.unihub.backend.common.Constants.Estudiante.REGISTRAR_URL;

@RestController
@RequestMapping
public class EstudianteController {

    private final EstudianteService estudianteService;
    private final JwtService jwtService;

    public EstudianteController(EstudianteService estudianteService, JwtService jwtService) {
        this.estudianteService = estudianteService;
        this.jwtService = jwtService;
    }

    @PostMapping(REGISTRAR_URL)
    public ResponseEntity<EstudianteResponse> registrar(
            @Valid @RequestBody EstudianteRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(estudianteService.registrar(request));
    }

    @PutMapping(ACTUALIZAR_URL)
    public ResponseEntity<EstudianteResponse> actualizar(
            @PathVariable Long id,
            @RequestAttribute(value = JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE, required = false) Long authenticatedStudentId,
            @Valid @RequestBody EstudianteActualizacionRequest request
    ) {
        jwtService.verificarPropiedad(authenticatedStudentId, id);
        return ResponseEntity.ok(estudianteService.actualizar(id, request));
    }

    @PostMapping(LOGIN_URL)
    public ResponseEntity<EstudianteLoginResponse> iniciarSesion(
            @Valid @RequestBody EstudianteLoginRequest request
    ) {
        return ResponseEntity.ok(estudianteService.iniciarSesion(request));
    }

}
