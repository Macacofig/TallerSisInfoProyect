package com.unihub.backend.controller;

import com.unihub.backend.dto.calificacion.CalificacionMateriaPromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionMateriaResponse;
import com.unihub.backend.service.CalificacionMateriaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CalificacionMateriaController.class)
class CalificacionMateriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CalificacionMateriaService calificacionService;

    @Test
    void deberiaCrearCalificacionDeMateria() throws Exception {
        when(calificacionService.crear(any())).thenReturn(new CalificacionMateriaResponse(
                1L,
                1L,
                null,
                8,
                6,
                5,
                "Matematicas,Logica",
                "Practico",
                "I-Año"
        ));

        mockMvc.perform(post("/api/calificacion-materia")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idMateria": 1,
                                  "idEstudiante": null,
                                  "dificultad": 8,
                                  "carga": 6,
                                  "conocimientoPrevio": 5,
                                  "prerequisitos": ["Matematicas", "Logica"],
                                  "predominio": "Practico",
                                  "gestion": "I-Año"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idMateria").value(1))
                .andExpect(jsonPath("$.idEstudiante").doesNotExist())
                .andExpect(jsonPath("$.prerequisitosText").value("Matematicas,Logica"))
                .andExpect(jsonPath("$.predominio").value("Practico"))
                .andExpect(jsonPath("$.gestion").value("I-Año"));

        verify(calificacionService).crear(any());
        mostrarResultado("Crear calificación de materia");
    }

    @Test
    void deberiaRechazarValoresFueraDelRango() throws Exception {
        mockMvc.perform(post("/api/calificacion-materia")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "idMateria": 1,
                                  "dificultad": 11,
                                  "carga": 6,
                                  "conocimientoPrevio": 5,
                                  "prerequisitos": ["Matematicas"],
                                  "predominio": "Teorico",
                                  "gestion": "II-Año"
                                }
                                """))
                .andExpect(status().isBadRequest());

        verify(calificacionService, never()).crear(any());
        mostrarResultado("Rechazar calificación fuera del rango de 1 a 10");
    }

          @Test
          void deberiaObtenerPromediosDeTodasLasCalificacionesDeUnaMateria() throws Exception {
        when(calificacionService.obtenerPromediosPorMateria(1L)).thenReturn(
          java.util.Optional.of(new CalificacionMateriaPromedioResponse(
            1L, null, null, 7.5, 6.0, 8.0
          ))
        );

        mockMvc.perform(get("/api/calificacion-materia/materia/1"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.idMateria").value(1))
          .andExpect(jsonPath("$.dificultadPromedio").value(7.5))
          .andExpect(jsonPath("$.cargaPromedio").value(6.0))
          .andExpect(jsonPath("$.conocimientoPrevioPromedio").value(8.0));

        verify(calificacionService).obtenerPromediosPorMateria(1L);
        mostrarResultado("Obtener los promedios de dificultad, carga y conocimiento previo de una materia");
          }

          @Test
          void deberiaObtenerUnaCalificacionDeUnEstudiante() throws Exception {
        when(calificacionService.obtenerPorEstudiante(25L, 1L)).thenReturn(
          java.util.Optional.of(new CalificacionMateriaResponse(
            4L, 1L, 25L, 8, 6, 5, "Matematicas", "Practico", "I-Año"
          ))
        );

        mockMvc.perform(get("/api/calificacion-materia/estudiante/25/materia/1"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.idEstudiante").value(25))
          .andExpect(jsonPath("$.idMateria").value(1))
          .andExpect(jsonPath("$.dificultad").value(8));

        verify(calificacionService).obtenerPorEstudiante(25L, 1L);
        mostrarResultado("Obtener la calificación de un estudiante para una materia específica");
          }

          @Test
          void deberiaDevolverNullCuandoElEstudianteNoTieneCalificacionEnLaMateria() throws Exception {
        when(calificacionService.obtenerPorEstudiante(25L, 2L)).thenReturn(java.util.Optional.empty());

        mockMvc.perform(get("/api/calificacion-materia/estudiante/25/materia/2"))
          .andExpect(status().isOk())
          .andExpect(content().string(""));

        verify(calificacionService).obtenerPorEstudiante(25L, 2L);
        mostrarResultado("Devolver NULL cuando el estudiante no tiene calificación para la materia solicitada");
          }

          @Test
          void deberiaObtenerPromediosDeUnPeriodoEspecifico() throws Exception {
        when(calificacionService.obtenerPromediosPorGestion("I-Año")).thenReturn(
          java.util.Optional.of(new CalificacionMateriaPromedioResponse(
            null, "I-Año", "I-Año", 7.0, 6.5, 8.5
          ))
        );

        mockMvc.perform(get("/api/calificacion-materia/periodo/I-Año"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.gestionDesde").value("I-Año"))
          .andExpect(jsonPath("$.gestionHasta").value("I-Año"))
          .andExpect(jsonPath("$.dificultadPromedio").value(7.0))
          .andExpect(jsonPath("$.cargaPromedio").value(6.5));

        verify(calificacionService).obtenerPromediosPorGestion("I-Año");
        mostrarResultado("Obtener los promedios de una gestión específica");
          }

          @Test
          void deberiaObtenerSoloLasGestionesConCalificaciones() throws Exception {
        when(calificacionService.obtenerGestiones()).thenReturn(List.of("I-Año", "II-Año"));

        mockMvc.perform(get("/api/calificacion-materia/gestiones"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$[0]").value("I-Año"))
          .andExpect(jsonPath("$[1]").value("II-Año"));

        verify(calificacionService).obtenerGestiones();
        mostrarResultado("Obtener únicamente las gestiones que tienen calificaciones");
          }

          @Test
          void deberiaObtenerPromediosDeUnRangoDePeriodos() throws Exception {
        when(calificacionService.obtenerPromediosPorRango("I-Año", "II-Año")).thenReturn(
          java.util.Optional.of(new CalificacionMateriaPromedioResponse(
            null, "I-Año", "II-Año", 7.25, 6.75, 8.25
          ))
        );

        mockMvc.perform(get("/api/calificacion-materia/periodo/rango")
            .param("desde", "I-Año")
            .param("hasta", "II-Año"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.gestionDesde").value("I-Año"))
          .andExpect(jsonPath("$.gestionHasta").value("II-Año"))
          .andExpect(jsonPath("$.conocimientoPrevioPromedio").value(8.25));

        verify(calificacionService).obtenerPromediosPorRango("I-Año", "II-Año");
        mostrarResultado("Obtener los promedios dentro de un rango de gestiones");
          }

    private void mostrarResultado(String descripcion) {
        System.out.println("-----------------------------");
        System.out.println(descripcion);
        System.out.println("Resultado: OK");
        System.out.println("-----------------------------");
    }
}
