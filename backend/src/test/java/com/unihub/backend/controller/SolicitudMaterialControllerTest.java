package com.unihub.backend.controller;

import com.unihub.backend.dto.material.SolicitudMaterialResponse;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.service.SolicitudMaterialService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SolicitudMaterialController.class)
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=false")
class SolicitudMaterialControllerTest {

    private static final long SOLICITUD_ID = 1L;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SolicitudMaterialService solicitudMaterialService;

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
