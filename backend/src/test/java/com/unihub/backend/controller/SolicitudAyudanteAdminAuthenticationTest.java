package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationConfig;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.service.JwtService;
import com.unihub.backend.service.SolicitudAyudanteService;
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

import java.util.UUID;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SolicitudAyudanteController.class)
@Import({JwtAuthenticationConfig.class, JwtAuthenticationInterceptor.class, JwtService.class})
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=true")
class SolicitudAyudanteAdminAuthenticationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @MockitoBean private SolicitudAyudanteService solicitudAyudanteService;
    @MockitoBean private EstudianteRepository estudianteRepository;

    @DynamicPropertySource
    static void claveEfimera(DynamicPropertyRegistry registry) {
        registry.add("app.jwt.secret", () -> UUID.randomUUID().toString());
    }

    @Test
    void mantienePendientesInaccesiblesSinContratoDeRolAdministrador() throws Exception {
        mockMvc.perform(get("/api/solicitud-ayudante/pendientes"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/solicitud-ayudante/pendientes")
                        .header("Authorization", "Bearer " + tokenEstudiante(7L)))
                .andExpect(status().isForbidden());
        verifyNoInteractions(solicitudAyudanteService);
    }

    @Test
    void mantieneDecisionesInaccesiblesSinContratoDeRolAdministrador() throws Exception {
        mockMvc.perform(post("/api/solicitud-ayudante/17/aprobar")
                        .header("Authorization", "Bearer " + tokenEstudiante(7L)))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/solicitud-ayudante/17/rechazar")
                        .header("Authorization", "Bearer " + tokenEstudiante(7L)))
                .andExpect(status().isForbidden());
        verifyNoInteractions(solicitudAyudanteService);
    }

    @Test
    void tokenAdminSoloAutorizaSiElRepositorioConfirmaRolVigente() throws Exception {
        Estudiante admin = new Estudiante("Admin", "hash", "70000000", "admin@test.com", "Sistemas");
        ReflectionTestUtils.setField(admin, "id", 8L);
        admin.actualizarRol(Estudiante.Rol.ADMIN);
        when(estudianteRepository.findByIdAndRol(8L, Estudiante.Rol.ADMIN)).thenReturn(Optional.of(admin));
        when(solicitudAyudanteService.obtenerPendientes()).thenReturn(List.of());
        mockMvc.perform(get("/api/solicitud-ayudante/pendientes").header("Authorization", "Bearer " + jwtService.generarToken(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void operacionesLegacyAdministrativasRechazanEstudiantes() throws Exception {
        String token = "Bearer " + tokenEstudiante(7L);
        mockMvc.perform(get("/api/ayudante-materia/pendientes").header("Authorization", token))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/ayudante-materia/1/aprobar").header("Authorization", token))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/ayudante-materia").header("Authorization", token))
                .andExpect(status().isForbidden());
    }

    @Test
    void unTokenConClaimAdminNoAutorizaSiElRolFueRevocado() throws Exception {
        Estudiante admin = new Estudiante("Admin", "hash", "70000000", "admin@test.com", "Sistemas");
        ReflectionTestUtils.setField(admin, "id", 9L);
        admin.actualizarRol(Estudiante.Rol.ADMIN);
        mockMvc.perform(get("/api/solicitud-ayudante/pendientes").header("Authorization", "Bearer " + jwtService.generarToken(admin)))
                .andExpect(status().isForbidden());
        verifyNoInteractions(solicitudAyudanteService);
    }

    private String tokenEstudiante(Long id) {
        Estudiante estudiante = new Estudiante("Estudiante", "pass", "70000000", "test@test.com", "Sistemas");
        ReflectionTestUtils.setField(estudiante, "id", id);
        return jwtService.generarToken(estudiante);
    }
}
