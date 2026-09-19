package com.unihub.backend.controller;

import com.unihub.backend.dto.calificacion.CalificacionDocentePromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionDocenteResponse;
import com.unihub.backend.service.CalificacionDocenteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CalificacionDocenteController.class)
class CalificacionDocenteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CalificacionDocenteService calificacionService;

    @Test
    void deberiaCrearCalificacionDeDocente() throws Exception {
        when(calificacionService.crear(any())).thenReturn(new CalificacionDocenteResponse(
                1L, 1L, 25L, 8, 7, 9, "año-I"
        ));

        mockMvc.perform(post("/api/calificacion-docente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idDocente": 1,
                                  "idEstudiante": 25,
                                  "claridadExplicaciones": 8,
                                  "metodologia": 7,
                                  "relacionClasesEvaluaciones": 9,
                                  "gestion": "año-I"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idDocente").value(1))
                .andExpect(jsonPath("$.idEstudiante").value(25))
                .andExpect(jsonPath("$.claridadExplicaciones").value(8))
                .andExpect(jsonPath("$.gestion").value("año-I"));

        verify(calificacionService).crear(any());
        mostrarResultado("Crear calificación de docente");
    }

    @Test
    void deberiaRechazarValoresFueraDelRango() throws Exception {
        mockMvc.perform(post("/api/calificacion-docente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idDocente": 1,
                                  "idEstudiante": 25,
                                  "claridadExplicaciones": 11,
                                  "metodologia": 7,
                                  "relacionClasesEvaluaciones": 9,
                                  "gestion": "año-I"
                                }
                                """))
                .andExpect(status().isBadRequest());

        verify(calificacionService, never()).crear(any());
        mostrarResultado("Rechazar calificación docente fuera del rango de 1 a 10");
    }

    @Test
    void deberiaObtenerPromediosDeUnDocente() throws Exception {
        when(calificacionService.obtenerPromediosPorDocente(1L)).thenReturn(Optional.of(
                new CalificacionDocentePromedioResponse(1L, null, null, 7.5, 6.0, 8.0)
        ));

        mockMvc.perform(get("/api/calificacion-docente/docente/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDocente").value(1))
                .andExpect(jsonPath("$.claridadExplicacionesPromedio").value(7.5))
                .andExpect(jsonPath("$.metodologiaPromedio").value(6.0))
                .andExpect(jsonPath("$.relacionClasesEvaluacionesPromedio").value(8.0));

        verify(calificacionService).obtenerPromediosPorDocente(1L);
        mostrarResultado("Obtener los promedios de evaluación de un docente");
    }

    @Test
    void deberiaObtenerUnaCalificacionDeUnEstudiante() throws Exception {
        when(calificacionService.obtenerPorEstudiante(25L, 1L)).thenReturn(Optional.of(
                new CalificacionDocenteResponse(4L, 1L, 25L, 8, 7, 9, "año-I")
        ));

        mockMvc.perform(get("/api/calificacion-docente/estudiante/25/docente/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idEstudiante").value(25))
                .andExpect(jsonPath("$.idDocente").value(1))
                .andExpect(jsonPath("$.claridadExplicaciones").value(8));

        verify(calificacionService).obtenerPorEstudiante(25L, 1L);
        mostrarResultado("Obtener la calificación de un estudiante para un docente específico");
    }

    @Test
    void deberiaDevolverNullCuandoElEstudianteNoTieneCalificacionDelDocente() throws Exception {
        when(calificacionService.obtenerPorEstudiante(25L, 2L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/calificacion-docente/estudiante/25/docente/2"))
                .andExpect(status().isOk())
                .andExpect(content().string(""));

        verify(calificacionService).obtenerPorEstudiante(25L, 2L);
        mostrarResultado("Devolver NULL cuando el estudiante no ha calificado al docente solicitado");
    }

    @Test
    void deberiaActualizarLaCalificacionDeUnEstudiante() throws Exception {
        when(calificacionService.actualizar(any(), any(), any())).thenReturn(Optional.of(
                new CalificacionDocenteResponse(4L, 1L, 25L, 10, 8, 9, "año-II")
        ));

        mockMvc.perform(put("/api/calificacion-docente/estudiante/25/docente/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idDocente": 1,
                                  "idEstudiante": 25,
                                  "claridadExplicaciones": 10,
                                  "metodologia": 8,
                                  "relacionClasesEvaluaciones": 9,
                                  "gestion": "año-II"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.claridadExplicaciones").value(10))
                .andExpect(jsonPath("$.gestion").value("año-II"));

        verify(calificacionService).actualizar(any(), any(), any());
        mostrarResultado("Actualizar la calificación de un estudiante");
    }

    @Test
    void deberiaEliminarLaCalificacionDeUnEstudiante() throws Exception {
        when(calificacionService.eliminar(25L, 1L)).thenReturn(true);

        mockMvc.perform(delete("/api/calificacion-docente/estudiante/25/docente/1"))
                .andExpect(status().isNoContent());

        verify(calificacionService).eliminar(25L, 1L);
        mostrarResultado("Eliminar la calificación de un estudiante");
    }

    @Test
    void deberiaObtenerPromediosDeUnaGestion() throws Exception {
        when(calificacionService.obtenerPromediosPorGestion("año-I")).thenReturn(Optional.of(
                new CalificacionDocentePromedioResponse(null, "año-I", "año-I", 7.0, 6.5, 8.5)
        ));

        mockMvc.perform(get("/api/calificacion-docente/periodo/año-I"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gestionDesde").value("año-I"))
                .andExpect(jsonPath("$.claridadExplicacionesPromedio").value(7.0));

        verify(calificacionService).obtenerPromediosPorGestion("año-I");
        mostrarResultado("Obtener los promedios de una gestión para docentes");
    }

    @Test
    void deberiaObtenerLasGestionesDisponibles() throws Exception {
        when(calificacionService.obtenerGestiones()).thenReturn(List.of("año-I", "año-II"));

        mockMvc.perform(get("/api/calificacion-docente/gestiones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("año-I"))
                .andExpect(jsonPath("$[1]").value("año-II"));

        verify(calificacionService).obtenerGestiones();
        mostrarResultado("Obtener las gestiones con calificaciones de docentes");
    }

    @Test
    void deberiaObtenerPromediosDeUnRangoDeGestiones() throws Exception {
        when(calificacionService.obtenerPromediosPorRango("año-I", "año-II")).thenReturn(Optional.of(
                new CalificacionDocentePromedioResponse(null, "año-I", "año-II", 7.25, 6.75, 8.25)
        ));

        mockMvc.perform(get("/api/calificacion-docente/periodo/rango")
                        .param("desde", "año-I")
                        .param("hasta", "año-II"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gestionHasta").value("año-II"))
                .andExpect(jsonPath("$.relacionClasesEvaluacionesPromedio").value(8.25));

        verify(calificacionService).obtenerPromediosPorRango("año-I", "año-II");
        mostrarResultado("Obtener los promedios dentro de un rango de gestiones docentes");
    }

    private void mostrarResultado(String descripcion) {
        System.out.println("-----------------------------");
        System.out.println(descripcion);
        System.out.println("Resultado: OK");
        System.out.println("-----------------------------");
    }
}