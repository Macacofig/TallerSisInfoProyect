package com.unihub.backend.controller;

import com.unihub.backend.config.*;
import com.unihub.backend.dto.notificacion.*;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificacionController.class)
@Import({JwtAuthenticationConfig.class, JwtAuthenticationInterceptor.class, JwtService.class})
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=true")
class NotificacionAuthenticationTest {
    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @MockitoBean EstudianteRepository estudiantes;
    @MockitoBean NotificacionService service;
    @DynamicPropertySource static void secret(DynamicPropertyRegistry r) {
        String key = UUID.randomUUID().toString();
        r.add("app.jwt.secret", () -> key);
    }

    private List<MockHttpServletRequestBuilder> requests() {
        return List.of(get("/api/notificaciones"), get("/api/notificaciones/no-leidas/count"),
                post("/api/notificaciones/7/leer"), post("/api/notificaciones/leer-todas"));
    }

    @Test void todasLasRutasExigenJwt() throws Exception {
        for (var request : requests()) mvc.perform(request).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test void todasLasRutasRechazanJwtInvalido() throws Exception {
        for (var request : requests()) mvc.perform(request.header("Authorization", "Bearer invalido"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test void adminSigueLimitadoASuIdentidad() throws Exception {
        var e = new Estudiante("Admin", "pass", "70000000", "admin@test.com", "Sistemas");
        e.actualizarRol(Estudiante.Rol.ADMIN);
        ReflectionTestUtils.setField(e, "id", 8L);
        var token = "Bearer " + jwt.generarToken(e);
        when(service.listar(8L, 0, 20)).thenReturn(new NotificacionesPageResponse(List.of(), 0, 20, 0, false));
        when(service.contarNoLeidas(8L)).thenReturn(new NotificacionesCountResponse(0));
        for (var request : requests()) mvc.perform(request.header("Authorization", token)).andExpect(status().is2xxSuccessful());
        verify(service).listar(8L, 0, 20);
        verify(service).contarNoLeidas(8L);
        verify(service).marcarComoLeida(8L, 7L);
        verify(service).marcarTodasComoLeidas(8L);
    }
}
