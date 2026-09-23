package com.unihub.backend.controller;

import com.unihub.backend.dto.docente.DocenteResponse;
import com.unihub.backend.service.DocenteService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DocenteController.class)
class DocenteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DocenteService docenteService;

    @Test
    void deberiaAgregarDocente() throws Exception {
        when(docenteService.agregar(any())).thenReturn(
                new DocenteResponse(4L, "Ana Pérez"));

        mockMvc.perform(post("/api/docentes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Ana Pérez"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(4))
                .andExpect(jsonPath("$.nombre").value("Ana Pérez"))
                .andExpect(jsonPath("$.nombre").value("Ana Pérez"));

        verify(docenteService).agregar(any());
    }

    @Test
    void deberiaRechazarDocenteSinNombre() throws Exception {
        mockMvc.perform(post("/api/docentes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "   "
                                }
                                """))
                .andExpect(status().isBadRequest());

        verify(docenteService, never()).agregar(any());
    }

    @Test
    void deberiaMostrarDocentesDeUnaMateria() throws Exception {
        when(docenteService.obtenerPorMateria(1L)).thenReturn(List.of(
                new DocenteResponse(4L, "Ana Pérez"),
                new DocenteResponse(7L, "Luis Gómez")
        ));

        mockMvc.perform(get("/api/docentes/materia/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].nombre").value("Ana Pérez"))
                .andExpect(jsonPath("$[1].nombre").value("Luis Gómez"));

        verify(docenteService).obtenerPorMateria(1L);
    }
}