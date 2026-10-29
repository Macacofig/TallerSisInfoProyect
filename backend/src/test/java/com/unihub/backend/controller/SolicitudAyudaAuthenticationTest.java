package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationConfig;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.dto.ayudante.SolicitudAyudaRequest;
import com.unihub.backend.dto.ayudante.SolicitudAyudaResponse;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.service.JwtService;
import com.unihub.backend.service.SolicitudAyudaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SolicitudAyudaController.class)
@Import({JwtAuthenticationConfig.class, JwtAuthenticationInterceptor.class, JwtService.class})
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=true")
class SolicitudAyudaAuthenticationTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @MockitoBean private SolicitudAyudaService solicitudAyudaService;

    @DynamicPropertySource
    static void claveEfimera(DynamicPropertyRegistry registry) {
        String clave = UUID.randomUUID().toString();
        registry.add("app.jwt.secret", () -> clave);
    }

    private static final String BODY = """
            {"idEstudiante":99,"idAyudante":8,"idMateria":25,"peticion":"Mensaje completo"}
            """;

    private String token(Long id) {
        Estudiante estudiante = new Estudiante("Estudiante", "pass", "70000000", "test@test.com", "Sistemas");
        ReflectionTestUtils.setField(estudiante, "id", id);
        return jwtService.generarToken(estudiante);
    }

    @Test
    void rechazaCreacionSinToken() throws Exception {
        mockMvc.perform(post("/api/solicitud-ayuda").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(solicitudAyudaService);
    }

    @Test
    void rechazaTokenInvalido() throws Exception {
        mockMvc.perform(post("/api/solicitud-ayuda").header("Authorization", "Bearer invalido")
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(solicitudAyudaService);
    }

    @Test
    void rechazaSuplantacionDeOtroEstudiante() throws Exception {
        mockMvc.perform(post("/api/solicitud-ayuda").header("Authorization", "Bearer " + token(2L))
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isForbidden());
        verifyNoInteractions(solicitudAyudaService);
    }

    @Test
    void creaSoloParaElEstudianteDelJwt() throws Exception {
        SolicitudAyudaRequest request = new SolicitudAyudaRequest(99L, 8L, 25L, "Mensaje completo");
        when(solicitudAyudaService.solicitarAyuda(request)).thenReturn(new SolicitudAyudaResponse(
                501L, 99L, "Estudiante", 8L, "Ayudante", 25L, "INF101", "Materia", "Mensaje completo", "RESUELTA"));
        mockMvc.perform(post("/api/solicitud-ayuda").header("Authorization", "Bearer " + token(99L))
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("RESUELTA"));
        verify(solicitudAyudaService, times(1)).solicitarAyuda(request);
    }

    @Test
    void conservaLaValidacionDelMensaje() throws Exception {
        mockMvc.perform(post("/api/solicitud-ayuda").header("Authorization", "Bearer " + token(99L))
                        .contentType(MediaType.APPLICATION_JSON).content(BODY.replace("Mensaje completo", "   ")))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(solicitudAyudaService);
    }
}
