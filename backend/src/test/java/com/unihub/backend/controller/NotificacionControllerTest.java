package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.dto.notificacion.*;
import com.unihub.backend.exception.*;
import com.unihub.backend.service.NotificacionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificacionController.class)
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=false")
class NotificacionControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean NotificacionService service;
    private static final String OWNER = JwtAuthenticationInterceptor.STUDENT_ID_ATTRIBUTE;

    @Test void paginaUsaIdentidadDelServidorIgnorandoIdArbitrario() throws Exception {
        when(service.listar(8L, 0, 20)).thenReturn(new NotificacionesPageResponse(List.of(), 0, 20, 0, false));
        mvc.perform(get("/api/notificaciones?idEstudiante=999").requestAttr(OWNER, 8L))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.hasMore").value(false)).andExpect(jsonPath("$.content").isEmpty());
        verify(service).listar(8L, 0, 20);
    }

    @Test void contadorYAcciones() throws Exception {
        when(service.contarNoLeidas(8L)).thenReturn(new NotificacionesCountResponse(3));
        mvc.perform(get("/api/notificaciones/no-leidas/count").requestAttr(OWNER, 8L))
                .andExpect(status().isOk()).andExpect(jsonPath("$.count").value(3));
        mvc.perform(post("/api/notificaciones/7/leer").requestAttr(OWNER, 8L)).andExpect(status().isNoContent());
        mvc.perform(post("/api/notificaciones/leer-todas").requestAttr(OWNER, 8L)).andExpect(status().isNoContent());
        verify(service).marcarComoLeida(8L, 7L);
        verify(service).marcarTodasComoLeidas(8L);
    }

    @Test void ajenaDevuelve404() throws Exception {
        doThrow(new ResourceNotFoundException("No encontrada")).when(service).marcarComoLeida(8L, 7L);
        mvc.perform(post("/api/notificaciones/7/leer").requestAttr(OWNER, 8L)).andExpect(status().isNotFound());
    }

    @Test void paginaInvalidaDevuelve400() throws Exception {
        when(service.listar(8L, 0, 101)).thenThrow(new BadRequestException("Tamaño inválido"));
        mvc.perform(get("/api/notificaciones?size=101").requestAttr(OWNER, 8L)).andExpect(status().isBadRequest());
    }
}
