package com.unihub.backend.controller;

import com.unihub.backend.dto.calificacion.CalificacionResponse;
import com.unihub.backend.service.CalificacionMateriaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
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
        when(calificacionService.crear(any())).thenReturn(new CalificacionResponse(
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

    private void mostrarResultado(String descripcion) {
        System.out.println("-----------------------------");
        System.out.println(descripcion);
        System.out.println("Resultado: OK");
        System.out.println("-----------------------------");
    }
}
