package com.unihub.backend.controller;

import com.unihub.backend.dto.estudiante.EstudianteLoginRequest;
import com.unihub.backend.dto.estudiante.EstudianteLoginResponse;
import com.unihub.backend.dto.estudiante.EstudianteActualizacionRequest;
import com.unihub.backend.dto.estudiante.EstudianteMateriasAprobadasRequest;
import com.unihub.backend.dto.estudiante.EstudianteMateriasAprobadasResponse;
import com.unihub.backend.dto.estudiante.EstudianteMateriaAprobadaRequest;
import com.unihub.backend.dto.estudiante.EstudianteRecuperarContrasenaRequest;
import com.unihub.backend.dto.estudiante.EstudianteRequest;
import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.dto.estudiante.EstudianteTelefonoResponse;
import com.unihub.backend.exception.BadRequestException;
import com.unihub.backend.service.EstudianteService;
import com.unihub.backend.service.JwtService;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static com.unihub.backend.common.Constants.Estudiante.ACTUALIZAR_URL;
import static com.unihub.backend.common.Constants.Estudiante.LOGIN_URL;
import static com.unihub.backend.common.Constants.Estudiante.MATERIAS_APROBADAS_URL;
import static com.unihub.backend.common.Constants.Estudiante.ELIMINAR_MATERIA_APROBADA_URL;
import static com.unihub.backend.common.Constants.Estudiante.RECUPERAR_CONTRASENA_URL;
import static com.unihub.backend.common.Constants.Estudiante.REGISTRAR_URL;
import static com.unihub.backend.common.Constants.Estudiante.TELEFONO_URL;

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

    @GetMapping(TELEFONO_URL)
    public ResponseEntity<EstudianteTelefonoResponse> obtenerTelefono(@PathVariable Long id) {
        return ResponseEntity.ok(estudianteService.obtenerTelefono(id));
    }

    @PostMapping(LOGIN_URL)
    public ResponseEntity<EstudianteLoginResponse> iniciarSesion(
            @Valid @RequestBody EstudianteLoginRequest request
    ) {
        return ResponseEntity.ok(estudianteService.iniciarSesion(request));
    }

    @GetMapping(MATERIAS_APROBADAS_URL)
    public ResponseEntity<EstudianteMateriasAprobadasResponse> obtenerMateriasAprobadas(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(estudianteService.obtenerMateriasAprobadas(id));
    }

    @PostMapping(MATERIAS_APROBADAS_URL)
    public ResponseEntity<EstudianteMateriasAprobadasResponse> agregarMateriasAprobadas(
            @PathVariable Long id,
            @RequestAttribute(value = JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE, required = false) Long authenticatedStudentId,
            @Valid @RequestBody EstudianteMateriasAprobadasRequest request
    ) {
        jwtService.verificarPropiedad(authenticatedStudentId, id);
        return ResponseEntity.ok(estudianteService.agregarMateriasAprobadas(id, request));
    }

    @PutMapping(MATERIAS_APROBADAS_URL)
    public ResponseEntity<EstudianteMateriasAprobadasResponse> actualizarMateriasAprobadas(
            @PathVariable Long id,
            @RequestAttribute(value = JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE, required = false) Long authenticatedStudentId,
            @Valid @RequestBody EstudianteMateriasAprobadasRequest request
    ) {
        jwtService.verificarPropiedad(authenticatedStudentId, id);
        return ResponseEntity.ok(estudianteService.agregarMateriasAprobadas(id, request));
    }

    @DeleteMapping(MATERIAS_APROBADAS_URL)
    public ResponseEntity<EstudianteMateriasAprobadasResponse> eliminarMateriaAprobada(
            @PathVariable Long id,
            @RequestAttribute(value = JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE, required = false) Long authenticatedStudentId,
            @RequestParam(required = false) String materia,
            @RequestBody(required = false) Object cuerpo
    ) {
        jwtService.verificarPropiedad(authenticatedStudentId, id);
        String materiaEliminar = materia;
        if (cuerpo instanceof String texto) {
            materiaEliminar = texto;
        } else if (cuerpo instanceof Map<?, ?> datos) {
            Object valorMateria = datos.get("materia");
            if (valorMateria instanceof String texto) {
                materiaEliminar = texto;
            }
        }
        if (materiaEliminar == null || materiaEliminar.isBlank()) {
            throw new BadRequestException("La materia es obligatoria");
        }
        return ResponseEntity.ok(estudianteService.eliminarMateriaAprobada(
                id,
                new EstudianteMateriaAprobadaRequest(materiaEliminar.trim())
        ));
    }

    @DeleteMapping(ELIMINAR_MATERIA_APROBADA_URL)
    public ResponseEntity<EstudianteMateriasAprobadasResponse> eliminarMateriaAprobadaPorRuta(
            @PathVariable Long id,
            @PathVariable String materia,
            @RequestAttribute(value = JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE, required = false) Long authenticatedStudentId
    ) {
        jwtService.verificarPropiedad(authenticatedStudentId, id);
        if (materia == null || materia.isBlank()) {
            throw new BadRequestException("La materia es obligatoria");
        }
        return ResponseEntity.ok(estudianteService.eliminarMateriaAprobada(
                id,
                new EstudianteMateriaAprobadaRequest(materia.trim())
        ));
    }
    @PostMapping(RECUPERAR_CONTRASENA_URL)
    public ResponseEntity<EstudianteResponse> recuperarContrasena(
            @Valid @RequestBody EstudianteRecuperarContrasenaRequest request
    ) {
        return ResponseEntity.ok(estudianteService.recuperarContrasena(request));
    }

}
