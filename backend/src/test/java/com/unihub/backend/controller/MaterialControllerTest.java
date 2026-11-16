package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationConfig;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.dto.material.MaterialResponse;
import com.unihub.backend.dto.material.MaterialSubidoResponse;
import com.unihub.backend.dto.material.SolicitudMaterialResponse;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.service.JwtService;
import com.unihub.backend.service.MaterialService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MaterialController.class)
@Import({JwtAuthenticationConfig.class, JwtAuthenticationInterceptor.class})
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=true")
class MaterialControllerTest {

    private static final long ESTUDIANTE_ID = 5L;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MaterialService materialService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private EstudianteRepository estudianteRepository;

    @Test
    void subeMaterialSinJwtYDevuelveCreated() throws Exception {
        MaterialResponse material = new MaterialResponse(
                15L,
                "https://proyecto.supabase.co/storage/v1/object/public/materiales/materias-3/apunte.pdf",
                "Apunte de clase",
                "Resumen del tema 1",
                "PDF",
                3L,
                "Programación I",
                9L,
                "Carlos Gómez",
                2,
                "PENDIENTE"
        );
        SolicitudMaterialResponse solicitud = new SolicitudMaterialResponse(
                22L, "Apunte de clase", ESTUDIANTE_ID, "Ana Pérez", 15L,
                material.linkMaterial(), "PENDIENTE");
        when(materialService.subirMaterialAcademico(any(), any(), eq(ESTUDIANTE_ID)))
                .thenReturn(new MaterialSubidoResponse(material, solicitud));

        MockMultipartFile documento = new MockMultipartFile(
                "documento", "apunte.pdf", "application/pdf", "contenido".getBytes());

        mockMvc.perform(multipart("/api/material/subir")
                        .file(documento)
                        .param("titulo", "Apunte de clase")
                        .param("descripcion", "Resumen del tema 1")
                        .param("idMateria", "3")
                        .param("idDocente", "9")
                        .param("semestreIngresado", "2")
                        .param("idEstudiante", String.valueOf(ESTUDIANTE_ID)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.material.id").value(15))
                .andExpect(jsonPath("$.material.tipo").value("PDF"))
                .andExpect(jsonPath("$.material.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.solicitud.estado").value("PENDIENTE"));

        verify(materialService).subirMaterialAcademico(any(), any(), eq(ESTUDIANTE_ID));
    }

    @Test
    void exigeElIdentificadorDelEstudiante() throws Exception {
        MockMultipartFile documento = new MockMultipartFile(
                "documento", "apunte.pdf", "application/pdf", "contenido".getBytes());

        mockMvc.perform(multipart("/api/material/subir")
                        .file(documento)
                        .param("titulo", "Apunte")
                        .param("descripcion", "Resumen")
                        .param("idMateria", "3")
                        .param("idDocente", "9"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(materialService);
    }

    @Test
    void obtieneLosMaterialesDeUnaMateriaSinJwt() throws Exception {
        MaterialResponse material = new MaterialResponse(
                15L,
                "https://proyecto.supabase.co/storage/v1/object/public/MaterialsTaller/materias-3/apunte.pdf",
                "Apunte de clase",
                "Resumen del tema 1",
                "PDF",
                3L,
                "Programación I",
                9L,
                "Carlos Gómez",
                2,
                "PENDIENTE"
        );
        when(materialService.obtenerPorMateria(3L)).thenReturn(List.of(material));

        mockMvc.perform(get("/api/material/materia/3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(15))
                .andExpect(jsonPath("$[0].titulo").value("Apunte de clase"))
                .andExpect(jsonPath("$[0].nombreMateria").value("Programación I"))
                .andExpect(jsonPath("$[0].nombreDocente").value("Carlos Gómez"))
                .andExpect(jsonPath("$[0].linkMaterial").value(
                        "https://proyecto.supabase.co/storage/v1/object/public/MaterialsTaller/materias-3/apunte.pdf"))
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));

        verify(materialService).obtenerPorMateria(3L);
    }
}
