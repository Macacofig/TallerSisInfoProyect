package com.unihub.backend.controller;

import com.unihub.backend.dto.calificacion.CalificacionDocentePromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionDocenteResponse;
import com.unihub.backend.exception.CalificacionDocenteDuplicadaException;
import com.unihub.backend.exception.DocenteInexistenteException;
import com.unihub.backend.service.CalificacionDocenteService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CalificacionDocenteController.class)
class CalificacionDocenteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CalificacionDocenteService calificacionService;

    @Test
        @DisplayName("Crear una calificacion de docente asociada obligatoriamente a una materia")
    void deberiaCrearCalificacionIncluyendoMateria() throws Exception {
        when(calificacionService.crear(any())).thenReturn(
                new CalificacionDocenteResponse(1L, 1L, 10L, 25L, 8, 7, 9, "año-I"));

        mockMvc.perform(post("/api/calificacion-docente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idDocente":1,"idMateria":10,"idEstudiante":25,
                                 "claridadExplicaciones":8,"metodologia":7,
                                 "relacionClasesEvaluaciones":9,"gestion":"año-I"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idMateria").value(10));
        mostrarResultado("Crear una calificacion de docente asociada obligatoriamente a una materia");
    }

    @Test
        @DisplayName("Rechazar la creacion de una calificacion sin idMateria")
    void deberiaRechazarCalificacionSinMateria() throws Exception {
        mockMvc.perform(post("/api/calificacion-docente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idDocente":1,"idEstudiante":25,"claridadExplicaciones":8,
                                 "metodologia":7,"relacionClasesEvaluaciones":9,"gestion":"año-I"}
                                """))
                .andExpect(status().isBadRequest());
        mostrarResultado("Rechazar la creacion de una calificacion sin idMateria");
    }

                @Test
                void deberiaResponder400CuandoElDocenteNoExiste() throws Exception {
                                when(calificacionService.crear(any())).thenThrow(new DocenteInexistenteException());

                                mockMvc.perform(post("/api/calificacion-docente")
                                                                                                .contentType(MediaType.APPLICATION_JSON)
                                                                                                .content("""
                                                                                                                                {
                                                                                                                                        "idDocente": 99,
                                                                                                                                        "idMateria": 10,
                                                                                                                                        "idEstudiante": 25,
                                                                                                                                        "claridadExplicaciones": 8,
                                                                                                                                        "metodologia": 7,
                                                                                                                                        "relacionClasesEvaluaciones": 9,
                                                                                                                                        "gestion": "año-I"
                                                                                                                                }
                                                                                                                                """))
                                                                .andExpect(status().isBadRequest())
                                                                .andExpect(content().string("Este docente no existe"));

                                verify(calificacionService).crear(any());
                                mostrarResultado("Responder 400 cuando el docente no existe");
                }

                @Test
                void deberiaResponder409CuandoLaCalificacionEstaDuplicada() throws Exception {
                                when(calificacionService.crear(any())).thenThrow(new CalificacionDocenteDuplicadaException());

                                mockMvc.perform(post("/api/calificacion-docente")
                                                                                                .contentType(MediaType.APPLICATION_JSON)
                                                                                                .content("""
                                                                                                                                {
                                                                                                                                        "idDocente": 1,
                                                                                                                                        "idMateria": 10,
                                                                                                                                        "idEstudiante": 25,
                                                                                                                                        "claridadExplicaciones": 8,
                                                                                                                                        "metodologia": 7,
                                                                                                                                        "relacionClasesEvaluaciones": 9,
                                                                                                                                        "gestion": "año-I"
                                                                                                                                }
                                                                                                                                """))
                                                                .andExpect(status().isConflict())
                                                                .andExpect(content().string("Ya calificaste a este docente"));

                                verify(calificacionService).crear(any());
                                mostrarResultado("Responder 409 cuando la calificación está duplicada");
                }

    @Test
        @DisplayName("Obtener los promedios de todos los docentes de una materia")
    void deberiaConsultarPromediosDeDocentesPorMateria() throws Exception {
        when(calificacionService.obtenerPromediosPorMateria(10L)).thenReturn(List.of(
                new CalificacionDocentePromedioResponse(1L, null, null, 7.5, 6.0, 8.0, 10L, "Ana Docente"),
                new CalificacionDocentePromedioResponse(2L, null, null, 8.0, 7.5, 9.0, 10L, "Luis Docente")));

        mockMvc.perform(get("/api/calificacion-docente/materia/10/docentes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idMateria").value(10))
                .andExpect(jsonPath("$[0].idDocente").value(1))
                .andExpect(jsonPath("$[0].nombreDocente").value("Ana Docente"))
                .andExpect(jsonPath("$[1].idDocente").value(2));
        mostrarResultado("Obtener los promedios de todos los docentes de una materia");
    }

    @Test
        @DisplayName("Consultar, actualizar y eliminar la calificacion de un estudiante en una materia")
    void deberiaConsultarActualizarYEliminarCalificacionPorMateria() throws Exception {
        when(calificacionService.obtenerPorEstudiante(25L, 1L, 10L)).thenReturn(Optional.of(
                new CalificacionDocenteResponse(4L, 1L, 10L, 25L, 8, 7, 9, "año-I")));
        when(calificacionService.actualizar(eq(25L), eq(1L), eq(10L), any())).thenReturn(Optional.of(
                new CalificacionDocenteResponse(4L, 1L, 10L, 25L, 10, 8, 9, "año-II")));
        when(calificacionService.eliminar(25L, 1L, 10L)).thenReturn(true);

        mockMvc.perform(get("/api/calificacion-docente/estudiante/25/docente/1/materia/10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.idMateria").value(10));
        mockMvc.perform(put("/api/calificacion-docente/estudiante/25/docente/1/materia/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idDocente":1,"idMateria":10,"idEstudiante":25,
                                "claridadExplicaciones":10,"metodologia":8,
                                "relacionClasesEvaluaciones":9,"gestion":"año-II"}
                                """))
                .andExpect(status().isOk()).andExpect(jsonPath("$.gestion").value("año-II"));
        mockMvc.perform(delete("/api/calificacion-docente/estudiante/25/docente/1/materia/10"))
                .andExpect(status().isNoContent());
        mostrarResultado("Consultar, actualizar y eliminar la calificacion de un estudiante en una materia");
    }

    @Test
        @DisplayName("Filtrar promedios y gestiones por materia")
    void deberiaFiltrarPromediosYGestionesPorMateria() throws Exception {
        when(calificacionService.obtenerPromediosPorMateriaYGestion(10L, "año-I")).thenReturn(List.of(
                new CalificacionDocentePromedioResponse(1L, "año-I", "año-I", 7.0, 6.5, 8.5, 10L, "Ana Docente")));
        when(calificacionService.obtenerGestiones(10L)).thenReturn(List.of("año-I", "año-II"));
        when(calificacionService.obtenerPromediosPorMateriaYRango(10L, "año-I", "año-II")).thenReturn(List.of(
                new CalificacionDocentePromedioResponse(1L, "año-I", "año-II", 7.25, 6.75, 8.25, 10L, "Ana Docente")));

        mockMvc.perform(get("/api/calificacion-docente/materia/10/periodo/año-I"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].idMateria").value(10));
        mockMvc.perform(get("/api/calificacion-docente/materia/10/gestiones"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[1]").value("año-II"));
        mockMvc.perform(get("/api/calificacion-docente/materia/10/periodo/rango")
                        .param("desde", "año-I").param("hasta", "año-II"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].gestionHasta").value("año-II"));
                mostrarResultado("Filtrar promedios y gestiones por materia");
        }

        private void mostrarResultado(String mensaje) {
                System.out.println("[TEST CALIFICACION DOCENTE] " + mensaje + " - OK");
    }
}
