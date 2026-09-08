package com.unihub.backend.controller;

import com.unihub.backend.dto.materia.MateriaResponse;
import com.unihub.backend.service.MateriaService;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MateriaController.class)
class MateriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MateriaService materiaService;


    @Test
    void deberiaRetornarTodasLasMaterias() throws Exception {

        List<MateriaResponse> materias = List.of(

                new MateriaResponse(
                        1L,
                        "INF101",
                        "Programación I",
                        "Ingeniería de Sistemas",
                        1
                ),

                new MateriaResponse(
                        2L,
                        "INF202",
                        "Base de Datos",
                        "Ingeniería de Sistemas",
                        3
                )
        );

        when(materiaService.obtenerMaterias())
                .thenReturn(materias);


        mockMvc.perform(
                        get("/api/materias")
                                .contentType(MediaType.APPLICATION_JSON)
                )

                .andExpect(status().isOk())

                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                )

                .andExpect(jsonPath("$.size()").value(2))

                .andExpect(jsonPath("$[0].id").value(1))

                .andExpect(jsonPath("$[0].codigo").value("INF101"))

                .andExpect(jsonPath("$[0].nombre")
                        .value("Programación I"))

                .andExpect(jsonPath("$[1].nombre")
                        .value("Base de Datos"));
    }


    @Test
    void deberiaRetornarListaVacia() throws Exception {

        when(materiaService.obtenerMaterias())
                .thenReturn(List.of());


        mockMvc.perform(
                        get("/api/materias")
                                .contentType(MediaType.APPLICATION_JSON)
                )

                .andExpect(status().isOk())

                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                )

                .andExpect(jsonPath("$.size()").value(0));
    }
}