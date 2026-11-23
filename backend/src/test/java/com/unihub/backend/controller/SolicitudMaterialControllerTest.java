package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationConfig;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.dto.material.MaterialEstudianteResponse;
import com.unihub.backend.dto.material.SolicitudMaterialResponse;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.service.JwtService;
import com.unihub.backend.service.SolicitudMaterialService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SolicitudMaterialController.class)
@Import({JwtAuthenticationConfig.class, JwtAuthenticationInterceptor.class})
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=true")
class SolicitudMaterialControllerTest {

    private static final long SOLICITUD_ID = 1L;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SolicitudMaterialService solicitudMaterialService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private EstudianteRepository estudianteRepository;

    @Test
    void requiereJwtParaConsultarLosMaterialesDelEstudianteAutenticado() throws Exception {
        mockMvc.perform(get("/api/estudiantes/me/materiales"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rechazaJwtInvalidoAlConsultarLosMaterialesDelEstudiante() throws Exception {
        when(jwtService.obtenerIdEstudiante("token-invalido")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/estudiantes/me/materiales")
                        .header("Authorization", "Bearer token-invalido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void consultaSoloLosMaterialesDelIdValidadoDesdeElJwt() throws Exception {
        when(jwtService.obtenerIdEstudiante("token-ana")).thenReturn(Optional.of(7L));
        when(jwtService.obtenerIdEstudiante("token-lucia")).thenReturn(Optional.of(8L));
        when(solicitudMaterialService.obtenerPorEstudiante(7L)).thenReturn(List.of(
                new MaterialEstudianteResponse(1L, "Apunte de Ana", "Programación I", "PDF", "PENDIENTE")
        ));
        when(solicitudMaterialService.obtenerPorEstudiante(8L)).thenReturn(List.of(
                new MaterialEstudianteResponse(2L, "Guía de Lucía", null, null, "NEGADO")
        ));

        mockMvc.perform(get("/api/estudiantes/me/materiales")
                        .header("Authorization", "Bearer token-ana")
                        .param("idEstudiante", "8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Apunte de Ana"))
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));
        mockMvc.perform(get("/api/estudiantes/me/materiales")
                        .header("Authorization", "Bearer token-lucia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Guía de Lucía"))
                .andExpect(jsonPath("$[0].estado").value("NEGADO"));

        verify(solicitudMaterialService).obtenerPorEstudiante(7L);
        verify(solicitudMaterialService).obtenerPorEstudiante(8L);
    }

    @Test
    void devuelveListaVaciaCuandoElEstudianteNoTieneMateriales() throws Exception {
        when(jwtService.obtenerIdEstudiante("token-valido")).thenReturn(Optional.of(7L));
        when(solicitudMaterialService.obtenerPorEstudiante(7L)).thenReturn(List.of());

        mockMvc.perform(get("/api/estudiantes/me/materiales")
                        .header("Authorization", "Bearer token-valido"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void obtieneTodasLasSolicitudesDeMaterialSinJwt() throws Exception {
        when(solicitudMaterialService.obtenerTodas()).thenReturn(List.of(solicitud("PENDIENTE")));

        mockMvc.perform(get("/api/solicitud-material"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].titulo").value("Apunte de clase"))
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));
    }

    @Test
    void obtieneLasSolicitudesDeMaterialPendientes() throws Exception {
        when(solicitudMaterialService.obtenerPendientes()).thenReturn(List.of(solicitud("PENDIENTE")));

        mockMvc.perform(get("/api/solicitud-material/pendientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));
    }

    @Test
    void apruebaLaSolicitudYElMaterial() throws Exception {
        when(solicitudMaterialService.aprobar(SOLICITUD_ID)).thenReturn(solicitud("APROBADO"));

        mockMvc.perform(post("/api/solicitud-material/{idSolicitud}/aprobar", SOLICITUD_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("APROBADO"));
    }

    @Test
    void rechazaLaSolicitudYElMaterial() throws Exception {
        when(solicitudMaterialService.rechazar(SOLICITUD_ID)).thenReturn(solicitud("NEGADO"));

        mockMvc.perform(post("/api/solicitud-material/{idSolicitud}/rechazar", SOLICITUD_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("NEGADO"));
    }

    @Test
    void responde404CuandoLaSolicitudNoExisteAlAprobar() throws Exception {
        when(solicitudMaterialService.aprobar(99L))
                .thenThrow(new ResourceNotFoundException("La solicitud de material no existe"));

        mockMvc.perform(post("/api/solicitud-material/{idSolicitud}/aprobar", 99L))
                .andExpect(status().isNotFound());
    }

    private SolicitudMaterialResponse solicitud(String estado) {
        return new SolicitudMaterialResponse(
                SOLICITUD_ID,
                "Apunte de clase",
                7L,
                "Ana Pérez",
                15L,
                "https://proyecto.supabase.co/storage/v1/object/public/MaterialsTaller/materias-3/apunte.pdf",
                estado
        );
    }
}
