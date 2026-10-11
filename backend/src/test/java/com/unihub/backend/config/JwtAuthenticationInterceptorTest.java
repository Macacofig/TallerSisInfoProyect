package com.unihub.backend.config;

import com.unihub.backend.dto.estudiante.EstudianteLoginResponse;
import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.service.EstudianteService;
import com.unihub.backend.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(com.unihub.backend.controller.EstudianteController.class)
@Import({JwtAuthenticationConfig.class, JwtAuthenticationInterceptor.class})
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=true")
class JwtAuthenticationInterceptorTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EstudianteService estudianteService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void rechazaEndpointProtegidoSinToken() throws Exception {
        mockMvc.perform(put("/api/estudiantes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Ana\",\"telefono\":\"71234567\",\"carrera\":\"Medicina\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rechazaEndpointProtegidoConTokenInvalido() throws Exception {
        when(jwtService.obtenerIdEstudiante("token-invalido")).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/estudiantes/1")
                        .header("Authorization", "Bearer token-invalido")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Ana\",\"telefono\":\"71234567\",\"carrera\":\"Medicina\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void permiteEndpointProtegidoConTokenValido() throws Exception {
        when(jwtService.obtenerIdEstudiante("token-valido")).thenReturn(Optional.of(1L));
        when(estudianteService.actualizar(any(), any())).thenReturn(
                new EstudianteResponse(1L, "Ana", "71234567", "ana@ucb.edu.bo", "Medicina"));

        mockMvc.perform(put("/api/estudiantes/1")
                        .header("Authorization", "Bearer token-valido")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Ana\",\"telefono\":\"71234567\",\"carrera\":\"Medicina\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void mantienePublicoElInicioDeSesion() throws Exception {
        when(estudianteService.iniciarSesion(any())).thenReturn(new EstudianteLoginResponse(
                "token-generado", 3600,
                new EstudianteResponse(1L, "Ana", "71234567", "ana@ucb.edu.bo", "Medicina")));

        mockMvc.perform(post("/api/estudiantes/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correoElectronico\":\"ana@ucb.edu.bo\",\"contrasena\":\"ClaveSegura1!\"}"))
                .andExpect(status().isOk());
    }
}
