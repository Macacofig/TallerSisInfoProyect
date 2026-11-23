package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationConfig;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.service.JwtService;
import com.unihub.backend.service.SolicitudMaterialService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SolicitudMaterialController.class)
@Import({JwtAuthenticationConfig.class, JwtAuthenticationInterceptor.class, JwtService.class})
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=true")
class SolicitudMaterialAdminAuthenticationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @MockitoBean private SolicitudMaterialService solicitudMaterialService;
    @MockitoBean private EstudianteRepository estudianteRepository;

    @DynamicPropertySource
    static void claveEfimera(DynamicPropertyRegistry registry) {
        registry.add("app.jwt.secret", () -> UUID.randomUUID().toString());
    }

    @Test
    void protegeListaPendienteSinJwt() throws Exception {
        mockMvc.perform(get("/api/solicitud-material/pendientes"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(solicitudMaterialService);
    }

    @Test
    void estudianteNoPuedeListarDecidirNiEliminarSolicitudes() throws Exception {
        String token = "Bearer " + tokenEstudiante(7L);

        mockMvc.perform(get("/api/solicitud-material/pendientes").header("Authorization", token))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/solicitud-material/1/aprobar").header("Authorization", token))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/solicitud-material/1/rechazar").header("Authorization", token))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/solicitud-material/1").header("Authorization", token))
                .andExpect(status().isForbidden());

        verifyNoInteractions(solicitudMaterialService);
    }

    @Test
    void administradorPuedeConsultarPendientes() throws Exception {
        Estudiante admin = new Estudiante("Admin", "hash", "70000000", "admin@test.com", "Sistemas");
        ReflectionTestUtils.setField(admin, "id", 8L);
        admin.actualizarRol(Estudiante.Rol.ADMIN);
        when(estudianteRepository.findByIdAndRol(8L, Estudiante.Rol.ADMIN)).thenReturn(Optional.of(admin));
        when(solicitudMaterialService.obtenerPendientes()).thenReturn(List.of());

        mockMvc.perform(get("/api/solicitud-material/pendientes")
                        .header("Authorization", "Bearer " + jwtService.generarToken(admin)))
                .andExpect(status().isOk());
    }

    private String tokenEstudiante(Long id) {
        Estudiante estudiante = new Estudiante("Estudiante", "pass", "70000000", "test@test.com", "Sistemas");
        ReflectionTestUtils.setField(estudiante, "id", id);
        return jwtService.generarToken(estudiante);
    }
}
