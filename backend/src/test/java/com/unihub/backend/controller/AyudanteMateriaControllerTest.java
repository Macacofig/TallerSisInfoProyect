package com.unihub.backend.controller;

import com.unihub.backend.dto.ayudante.AyudanteMateriaResponse;
import com.unihub.backend.service.AyudanteMateriaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AyudanteMateriaController.class)
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=false")
class AyudanteMateriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AyudanteMateriaService ayudanteMateriaService;

    private static int numeroPrueba;

    private AyudanteMateriaResponse response(Long id, Long idEstudiante, String nombreEstudiante, Long idMateria, String codigoMateria, String nombreMateria, String horario, String estado) {
        return new AyudanteMateriaResponse(id, idEstudiante, nombreEstudiante, idMateria, codigoMateria, nombreMateria, horario, estado);
    }

    private void mostrarResultado(String descripcion) {
        numeroPrueba++;
        System.out.println("-----------------------------");
        System.out.println("PRUEBA " + numeroPrueba);
        System.out.println("-----------------------------");
        System.out.println(descripcion);
        System.out.println("Resultado: OK");
        System.out.println("-----------------------------");
    }

    @Test
    void deberiaCrearSolicitudAyudante() throws Exception {
        AyudanteMateriaResponse expected = response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Lunes 10-12", "PENDIENTE");
        when(ayudanteMateriaService.crear(org.mockito.ArgumentMatchers.any())).thenReturn(expected);

        mockMvc.perform(post("/api/ayudante-materia")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idEstudiante\":1,\"idMateria\":1,\"horario\":\"Lunes 10-12\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombreEstudiante").value("Juan Pérez"))
                .andExpect(jsonPath("$.horario").value("Lunes 10-12"))
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));

        verify(ayudanteMateriaService).crear(org.mockito.ArgumentMatchers.any());
        mostrarResultado("Crear solicitud de ayudante");
    }

    @Test
    void deberiaObtenerAyudantesAprobadosPorMateria() throws Exception {
        when(ayudanteMateriaService.obtenerAyudantesAprobadosPorMateria(1L)).thenReturn(List.of(
                response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Lunes 10-12", "APROBADO"),
                response(2L, 2L, "María García", 1L, "INF101", "Programación I", "Miércoles 14-16", "APROBADO")
        ));

        mockMvc.perform(get("/api/ayudante-materia/materia/1/aprobados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].estado").value("APROBADO"))
                .andExpect(jsonPath("$[1].estado").value("APROBADO"));

        verify(ayudanteMateriaService).obtenerAyudantesAprobadosPorMateria(1L);
        mostrarResultado("Obtener ayudantes aprobados por materia");
    }

    @Test
    void deberiaDejarDeSerAyudante() throws Exception {
        mockMvc.perform(delete("/api/ayudante-materia/1/estudiante/1"))
                .andExpect(status().isNoContent());

        verify(ayudanteMateriaService).dejarDeSerAyudante(1L, 1L);
        mostrarResultado("Dejar de ser ayudante");
    }

    @Test
    void deberiaAprobarSolicitud() throws Exception {
        AyudanteMateriaResponse expected = response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Lunes 10-12", "APROBADO");
        when(ayudanteMateriaService.aprobarSolicitud(1L)).thenReturn(expected);

        mockMvc.perform(post("/api/ayudante-materia/1/aprobar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("APROBADO"));

        verify(ayudanteMateriaService).aprobarSolicitud(1L);
        mostrarResultado("Aprobar solicitud de ayudante");
    }

    @Test
    void deberiaRechazarSolicitud() throws Exception {
        AyudanteMateriaResponse expected = response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Lunes 10-12", "RECHAZADO");
        when(ayudanteMateriaService.rechazarSolicitud(1L)).thenReturn(expected);

        mockMvc.perform(post("/api/ayudante-materia/1/rechazar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RECHAZADO"));

        verify(ayudanteMateriaService).rechazarSolicitud(1L);
        mostrarResultado("Rechazar solicitud de ayudante");
    }

    @Test
    void deberiaObtenerSolicitudesPendientes() throws Exception {
        when(ayudanteMateriaService.obtenerSolicitudesPendientes()).thenReturn(List.of(
                response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Lunes 10-12", "PENDIENTE"),
                response(2L, 2L, "María García", 1L, "INF101", "Programación I", "Miércoles 14-16", "PENDIENTE")
        ));

        mockMvc.perform(get("/api/ayudante-materia/pendientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));

        verify(ayudanteMateriaService).obtenerSolicitudesPendientes();
        mostrarResultado("Obtener solicitudes pendientes");
    }
}