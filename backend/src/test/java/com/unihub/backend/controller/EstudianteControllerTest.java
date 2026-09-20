package com.unihub.backend.controller;

import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.service.EstudianteService;
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

@WebMvcTest(EstudianteController.class)
class EstudianteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EstudianteService estudianteService;

    @Test
    void deberiaRegistrarEstudiante() throws Exception {
        when(estudianteService.registrar(any())).thenReturn(new EstudianteResponse(
                1L, "Ana Pérez", "71234567", "ana@ucb.edu.bo", "Ingeniería de Sistemas"
        ));

        mockMvc.perform(post("/api/estudiantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "  Ana   Pérez  ",
                                  "contrasena": "ClaveSegura1!",
                                  "telefono": "71234567",
                                  "correoElectronico": "ana@ucb.edu.bo",
                                  "carrera": "Ingeniería   de Sistemas"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombre").value("Ana Pérez"))
                .andExpect(jsonPath("$.telefono").value("71234567"))
                .andExpect(jsonPath("$.correoElectronico").value("ana@ucb.edu.bo"))
                .andExpect(jsonPath("$.carrera").value("Ingeniería de Sistemas"))
                .andExpect(jsonPath("$.contrasena").doesNotExist());

        verify(estudianteService).registrar(any());
    }

    @Test
    void deberiaRechazarContrasenaSinRequisitos() throws Exception {
        mockMvc.perform(post("/api/estudiantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo("Clave1!")))
                .andExpect(status().isBadRequest());

        verify(estudianteService, never()).registrar(any());
    }

    @Test
    void deberiaRechazarTelefonoInvalido() throws Exception {
        mockMvc.perform(post("/api/estudiantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo("ClaveSegura1!", "51234567", "ana@ucb.edu.bo")))
                .andExpect(status().isBadRequest());

        verify(estudianteService, never()).registrar(any());
    }

    @Test
    void deberiaRechazarCorreoFueraDelDominioUcb() throws Exception {
        mockMvc.perform(post("/api/estudiantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo("ClaveSegura1!", "71234567", "ana@gmail.com")))
                .andExpect(status().isBadRequest());

        verify(estudianteService, never()).registrar(any());
    }

    private String cuerpo(String contrasena) {
        return cuerpo(contrasena, "71234567", "ana@ucb.edu.bo");
    }

    private String cuerpo(String contrasena, String telefono, String correo) {
        return """
                {
                  "nombre": "Ana Pérez",
                  "contrasena": "%s",
                  "telefono": "%s",
                  "correoElectronico": "%s",
                  "carrera": "Ingeniería de Sistemas"
                }
                """.formatted(contrasena, telefono, correo);
    }
}
