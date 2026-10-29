package com.unihub.backend.controller;

import com.unihub.backend.dto.ayudante.SolicitudAyudaResponse;
import com.unihub.backend.service.SolicitudAyudaService;
import com.unihub.backend.service.JwtService;
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

@WebMvcTest(SolicitudAyudaController.class)
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=false")
class SolicitudAyudaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SolicitudAyudaService solicitudAyudaService;

    @MockitoBean
    private JwtService jwtService;

    private static int numeroPrueba;

    private SolicitudAyudaResponse response(Long id, Long idEstudiante, String nombreEstudiante, Long idAyudante, String nombreAyudante, Long idMateria, String codigoMateria, String nombreMateria, String peticion, String estado) {
        return new SolicitudAyudaResponse(id, idEstudiante, nombreEstudiante, idAyudante, nombreAyudante, idMateria, codigoMateria, nombreMateria, peticion, estado);
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
    void deberiaCrearSolicitudAyuda() throws Exception {
        SolicitudAyudaResponse expected = response(1L, 1L, "Juan Pérez", 1L, "Carlos Ayudante", 1L, "INF101", "Programación I", "Necesito ayuda con el TP", "RESUELTA");
        when(solicitudAyudaService.solicitarAyuda(org.mockito.ArgumentMatchers.any())).thenReturn(expected);

        mockMvc.perform(post("/api/solicitud-ayuda")
                        .requestAttr("authenticatedStudentId", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idEstudiante\":1,\"idAyudante\":1,\"idMateria\":1,\"peticion\":\"Necesito ayuda con el TP\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombreEstudiante").value("Juan Pérez"))
                .andExpect(jsonPath("$.nombreAyudante").value("Carlos Ayudante"))
                .andExpect(jsonPath("$.peticion").value("Necesito ayuda con el TP"))
                .andExpect(jsonPath("$.estado").value("RESUELTA"));

        verify(solicitudAyudaService).solicitarAyuda(org.mockito.ArgumentMatchers.any());
        verify(jwtService).verificarPropiedad(1L, 1L);
        mostrarResultado("Crear solicitud de ayuda");
    }

    @Test
    void deberiaObtenerPorAyudante() throws Exception {
        when(solicitudAyudaService.obtenerPorAyudante(1L)).thenReturn(List.of(
                response(1L, 1L, "Juan Pérez", 1L, "Carlos Ayudante", 1L, "INF101", "Programación I", "Petición 1", "PENDIENTE"),
                response(2L, 2L, "María García", 1L, "Carlos Ayudante", 1L, "INF101", "Programación I", "Petición 2", "RESUELTA")
        ));

        mockMvc.perform(get("/api/solicitud-ayuda/ayudante/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].idAyudante").value(1));

        verify(solicitudAyudaService).obtenerPorAyudante(1L);
        mostrarResultado("Obtener solicitudes por ayudante");
    }

    @Test
    void deberiaObtenerPendientesPorAyudante() throws Exception {
        when(solicitudAyudaService.obtenerPendientesPorAyudante(1L)).thenReturn(List.of(
                response(1L, 1L, "Juan Pérez", 1L, "Carlos Ayudante", 1L, "INF101", "Programación I", "Petición pendiente", "PENDIENTE")
        ));

        mockMvc.perform(get("/api/solicitud-ayuda/ayudante/1/pendientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));

        verify(solicitudAyudaService).obtenerPendientesPorAyudante(1L);
        mostrarResultado("Obtener solicitudes pendientes por ayudante");
    }

    @Test
    void deberiaObtenerPorEstudiante() throws Exception {
        when(solicitudAyudaService.obtenerPorEstudiante(1L)).thenReturn(List.of(
                response(1L, 1L, "Juan Pérez", 1L, "Carlos Ayudante", 1L, "INF101", "Programación I", "Petición 1", "PENDIENTE"),
                response(2L, 1L, "Juan Pérez", 2L, "Pedro Ayudante", 2L, "INF202", "Base de Datos", "Petición 2", "RESUELTA")
        ));

        mockMvc.perform(get("/api/solicitud-ayuda/estudiante/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].idEstudiante").value(1));

        verify(solicitudAyudaService).obtenerPorEstudiante(1L);
        mostrarResultado("Obtener solicitudes por estudiante");
    }

    @Test
    void deberiaResolverSolicitud() throws Exception {
        SolicitudAyudaResponse expected = response(1L, 1L, "Juan Pérez", 1L, "Carlos Ayudante", 1L, "INF101", "Programación I", "Petición", "RESUELTA");
        when(solicitudAyudaService.resolver(1L)).thenReturn(expected);

        mockMvc.perform(post("/api/solicitud-ayuda/1/resolver"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RESUELTA"));

        verify(solicitudAyudaService).resolver(1L);
        mostrarResultado("Resolver solicitud de ayuda");
    }

    @Test
    void deberiaCancelarSolicitud() throws Exception {
        SolicitudAyudaResponse expected = response(1L, 1L, "Juan Pérez", 1L, "Carlos Ayudante", 1L, "INF101", "Programación I", "Petición", "CANCELADA");
        when(solicitudAyudaService.cancelar(1L, 1L)).thenReturn(expected);

        mockMvc.perform(post("/api/solicitud-ayuda/1/estudiante/1/cancelar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CANCELADA"));

        verify(solicitudAyudaService).cancelar(1L, 1L);
        mostrarResultado("Cancelar solicitud de ayuda");
    }
}
