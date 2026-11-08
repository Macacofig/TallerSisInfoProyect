package com.unihub.backend.controller;

import com.unihub.backend.dto.actividad.ActividadEstudianteResponse;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.service.ActividadEstudianteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ActividadEstudianteController.class)
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=false")
class ActividadEstudianteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ActividadEstudianteService actividadEstudianteService;

    @Test
    void deberiaInsertarActividad() throws Exception {
        when(actividadEstudianteService.insertar(any())).thenReturn(new ActividadEstudianteResponse(
                1L, 2L, "Calificar materia", "Calificación a materia",
                LocalDateTime.of(2026, 11, 7, 10, 30), "REALIZADO"));

        mockMvc.perform(post("/api/actividad-estudiante")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idEstudiante": 2,
                                  "titulo": "Calificar materia",
                                  "descripcion": "Calificación a materia",
                                  "estado": "REALIZADO"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.idEstudiante").value(2))
                .andExpect(jsonPath("$.titulo").value("Calificar materia"))
                .andExpect(jsonPath("$.estado").value("REALIZADO"));

        verify(actividadEstudianteService).insertar(any());
    }

    @Test
    void deberiaActualizarActividad() throws Exception {
        when(actividadEstudianteService.actualizar(eq(1L), any())).thenReturn(new ActividadEstudianteResponse(
                1L, 2L, "Solicitar ser ayudante en Cálculo I", "Solicitud enviada a ser probada",
                LocalDateTime.of(2026, 11, 7, 10, 30), "APROBADA"));

        mockMvc.perform(put("/api/actividad-estudiante/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "estado": "APROBADA"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("APROBADA"));

        verify(actividadEstudianteService).actualizar(eq(1L), any());
    }

    @Test
    void deberiaMostrarActividadesPorEstudiante() throws Exception {
        when(actividadEstudianteService.obtenerPorEstudiante(2L)).thenReturn(List.of(
                new ActividadEstudianteResponse(1L, 2L, "Calificar docente", "Calificación a docente",
                        LocalDateTime.of(2026, 11, 7, 10, 30), "REALIZADO")
        ));

        mockMvc.perform(get("/api/actividad-estudiante/estudiante/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Calificar docente"))
                .andExpect(jsonPath("$[0].idEstudiante").value(2));

        verify(actividadEstudianteService).obtenerPorEstudiante(2L);
    }

    @Test
    void deberiaResponder404CuandoElEstudianteNoExiste() throws Exception {
        doThrow(new ResourceNotFoundException("El estudiante no existe"))
                .when(actividadEstudianteService).obtenerPorEstudiante(99L);

        mockMvc.perform(get("/api/actividad-estudiante/estudiante/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deberiaRechazarActividadSinTitulo() throws Exception {
        mockMvc.perform(post("/api/actividad-estudiante")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idEstudiante": 2,
                                  "titulo": "",
                                  "descripcion": "Descripción"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
