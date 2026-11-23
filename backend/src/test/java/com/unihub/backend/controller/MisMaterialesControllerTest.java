package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationConfig;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.dto.material.SolicitudMaterialResponse;
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
import java.util.UUID;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SolicitudMaterialController.class)
@Import({JwtAuthenticationConfig.class, JwtAuthenticationInterceptor.class, JwtService.class})
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=true")
class MisMaterialesControllerTest {

    private static final long ESTUDIANTE_A = 41L;
    private static final long ESTUDIANTE_B = 73L;
    private static final String TEST_SECRET = UUID.randomUUID().toString();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private SolicitudMaterialService solicitudMaterialService;

    @MockitoBean
    private EstudianteRepository estudianteRepository;

    @DynamicPropertySource
    static void configurarJwt(DynamicPropertyRegistry registry) {
        registry.add("app.jwt.secret", () -> TEST_SECRET);
        registry.add("app.jwt.expiration-seconds", () -> 3600);
    }

    @Test
    void requiereJwtValidoAntesDeConsultarMateriales() throws Exception {
        mockMvc.perform(get("/api/estudiantes/me/materiales"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(solicitudMaterialService);
    }

    @Test
    void devuelveMaterialesYEstadosDelEstudianteAutenticado() throws Exception {
        when(solicitudMaterialService.obtenerPorEstudiante(ESTUDIANTE_A)).thenReturn(List.of(
                material(1L, ESTUDIANTE_A, "PENDIENTE"),
                material(2L, ESTUDIANTE_A, "APROBADO"),
                material(3L, ESTUDIANTE_A, "NEGADO")
        ));

        mockMvc.perform(get("/api/estudiantes/me/materiales")
                        .header("Authorization", token(ESTUDIANTE_A)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"))
                .andExpect(jsonPath("$[1].estado").value("APROBADO"))
                .andExpect(jsonPath("$[2].estado").value("NEGADO"))
                .andExpect(jsonPath("$[2].idMaterial").value(nullValue()));

        verify(solicitudMaterialService).obtenerPorEstudiante(ESTUDIANTE_A);
        verify(solicitudMaterialService, never()).obtenerPorEstudiante(ESTUDIANTE_B);
    }

    @Test
    void solicitudesDeCadaSesionSeFiltranPorElIdDeSuPropioJwt() throws Exception {
        when(solicitudMaterialService.obtenerPorEstudiante(ESTUDIANTE_A))
                .thenReturn(List.of(material(1L, ESTUDIANTE_A, "PENDIENTE")));
        when(solicitudMaterialService.obtenerPorEstudiante(ESTUDIANTE_B))
                .thenReturn(List.of(material(2L, ESTUDIANTE_B, "APROBADO")));

        mockMvc.perform(get("/api/estudiantes/me/materiales")
                        .header("Authorization", token(ESTUDIANTE_A)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idEstudiante").value(ESTUDIANTE_A));
        mockMvc.perform(get("/api/estudiantes/me/materiales")
                        .header("Authorization", token(ESTUDIANTE_B)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idEstudiante").value(ESTUDIANTE_B));

        verify(solicitudMaterialService).obtenerPorEstudiante(ESTUDIANTE_A);
        verify(solicitudMaterialService).obtenerPorEstudiante(ESTUDIANTE_B);
    }

    private String token(long estudianteId) {
        return "Bearer " + jwtService.generarToken(estudiante(estudianteId));
    }

    private Estudiante estudiante(long id) {
        Estudiante estudiante = new Estudiante(
                "Estudiante " + id, "pass", "70000000", "estudiante" + id + "@test.invalid", "Sistemas");
        ReflectionTestUtils.setField(estudiante, "id", id);
        return estudiante;
    }

    private SolicitudMaterialResponse material(long id, long estudianteId, String estado) {
        return new SolicitudMaterialResponse(
                id,
                "Material " + id,
                "Programación I",
                "Docente",
                "Estudiante " + estudianteId,
                "PDF",
                estudianteId,
                estado.equals("NEGADO") ? null : id + 100,
                null,
                estado
        );
    }
}
