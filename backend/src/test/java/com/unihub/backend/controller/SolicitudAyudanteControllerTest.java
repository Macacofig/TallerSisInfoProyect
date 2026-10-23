package com.unihub.backend.controller;

import com.unihub.backend.dto.ayudante.SolicitudAyudanteResponse;
import com.unihub.backend.service.SolicitudAyudanteService;
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

@WebMvcTest(SolicitudAyudanteController.class)
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=false")
class SolicitudAyudanteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SolicitudAyudanteService solicitudAyudanteService;

    private static int numeroPrueba;

    private SolicitudAyudanteResponse response(Long id, Long idEstudiante, String nombreEstudiante, Long idMateria, String codigoMateria, String nombreMateria, String motivo, Double calificacion, String horarios, String estado) {
        return new SolicitudAyudanteResponse(id, idEstudiante, nombreEstudiante, idMateria, codigoMateria, nombreMateria, motivo, calificacion, horarios, estado);
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
        SolicitudAyudanteResponse expected = response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Me gusta enseñar", 9.5, "Lunes 10-12", "PENDIENTE");
        when(solicitudAyudanteService.solicitar(org.mockito.ArgumentMatchers.any())).thenReturn(expected);

        mockMvc.perform(post("/api/solicitud-ayudante")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idEstudiante\":1,\"idMateria\":1,\"motivo\":\"Me gusta enseñar\",\"calificacion\":9.5,\"horarios\":\"Lunes 10-12\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombreEstudiante").value("Juan Pérez"))
                .andExpect(jsonPath("$.motivo").value("Me gusta enseñar"))
                .andExpect(jsonPath("$.calificacion").value(9.5))
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));

        verify(solicitudAyudanteService).solicitar(org.mockito.ArgumentMatchers.any());
        mostrarResultado("Crear solicitud de ayudante");
    }

    @Test
    void deberiaObtenerPorEstudiante() throws Exception {
        when(solicitudAyudanteService.obtenerPorEstudiante(1L)).thenReturn(List.of(
                response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Motivo 1", 9.0, "Lunes 10-12", "PENDIENTE"),
                response(2L, 1L, "Juan Pérez", 2L, "INF202", "Base de Datos", "Motivo 2", 8.5, "Martes 10-12", "APROBADA")
        ));

        mockMvc.perform(get("/api/solicitud-ayudante/estudiante/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].idMateria").value(1));

        verify(solicitudAyudanteService).obtenerPorEstudiante(1L);
        mostrarResultado("Obtener solicitudes por estudiante");
    }

    @Test
    void deberiaObtenerPorMateria() throws Exception {
        when(solicitudAyudanteService.obtenerPorMateria(1L)).thenReturn(List.of(
                response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Motivo 1", 9.0, "Lunes 10-12", "PENDIENTE"),
                response(2L, 2L, "María García", 1L, "INF101", "Programación I", "Motivo 2", 8.5, "Martes 10-12", "APROBADA")
        ));

        mockMvc.perform(get("/api/solicitud-ayudante/materia/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].idMateria").value(1));

        verify(solicitudAyudanteService).obtenerPorMateria(1L);
        mostrarResultado("Obtener solicitudes por materia");
    }

    @Test
    void deberiaObtenerPendientes() throws Exception {
        when(solicitudAyudanteService.obtenerPendientes()).thenReturn(List.of(
                response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Motivo 1", 9.0, "Lunes 10-12", "PENDIENTE")
        ));

        mockMvc.perform(get("/api/solicitud-ayudante/pendientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));

        verify(solicitudAyudanteService).obtenerPendientes();
        mostrarResultado("Obtener solicitudes pendientes");
    }

    @Test
    void deberiaAprobarSolicitud() throws Exception {
        SolicitudAyudanteResponse expected = response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Motivo", 9.0, "Lunes 10-12", "APROBADA");
        when(solicitudAyudanteService.aprobar(1L)).thenReturn(expected);

        mockMvc.perform(post("/api/solicitud-ayudante/1/aprobar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("APROBADA"));

        verify(solicitudAyudanteService).aprobar(1L);
        mostrarResultado("Aprobar solicitud");
    }

    @Test
    void deberiaRechazarSolicitud() throws Exception {
        SolicitudAyudanteResponse expected = response(1L, 1L, "Juan Pérez", 1L, "INF101", "Programación I", "Motivo", 9.0, "Lunes 10-12", "RECHAZADA");
        when(solicitudAyudanteService.rechazar(1L)).thenReturn(expected);

        mockMvc.perform(post("/api/solicitud-ayudante/1/rechazar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RECHAZADA"));

        verify(solicitudAyudanteService).rechazar(1L);
        mostrarResultado("Rechazar solicitud");
    }
}