package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.dto.notificacion.*;
import com.unihub.backend.service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.unihub.backend.common.Constants.Notificacion.*;

@RestController
@RequestMapping(BASE)
public class NotificacionController {
    private final NotificacionService service;

    public NotificacionController(NotificacionService service) { this.service = service; }

    @GetMapping
    public NotificacionesPageResponse listar(
            @RequestAttribute(JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE) Long estudianteAutenticado,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return service.listar(estudianteAutenticado, page, size);
    }

    @GetMapping(CONTAR_NO_LEIDAS_URL)
    public NotificacionesCountResponse contar(
            @RequestAttribute(JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE) Long estudianteAutenticado) {
        return service.contarNoLeidas(estudianteAutenticado);
    }

    @PostMapping(LEER_URL)
    public ResponseEntity<Void> leer(
            @RequestAttribute(JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE) Long estudianteAutenticado,
            @PathVariable Long id) {
        service.marcarComoLeida(estudianteAutenticado, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(LEER_TODAS_URL)
    public ResponseEntity<Void> leerTodas(
            @RequestAttribute(JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE) Long estudianteAutenticado) {
        service.marcarTodasComoLeidas(estudianteAutenticado);
        return ResponseEntity.noContent().build();
    }
}
