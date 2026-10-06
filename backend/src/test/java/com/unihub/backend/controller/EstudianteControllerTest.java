package com.unihub.backend.controller;

import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.exception.BadRequestException;
import com.unihub.backend.exception.CredencialesInvalidasException;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.service.EstudianteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
    void deberiaResponder400CuandoElCorreoYaEstaRegistrado() throws Exception {
        doThrow(new BadRequestException("El correo electrónico ya está registrado"))
                .when(estudianteService).registrar(any());

        mockMvc.perform(post("/api/estudiantes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo("ClaveSegura1!")))
                .andExpect(status().isBadRequest());
    }

        @Test
        void deberiaResponder401CuandoLasCredencialesSonInvalidas() throws Exception {
                doThrow(new CredencialesInvalidasException())
                                .when(estudianteService).iniciarSesion(any());

                mockMvc.perform(post("/api/estudiantes/login")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content("""
                                                                {
                                                                    "correoElectronico": "ana@ucb.edu.bo",
                                                                    "contrasena": "incorrecta"
                                                                }
                                                                """))
                                .andExpect(status().isUnauthorized());
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

        @Test
        void deberiaActualizarTodosLosCampos() throws Exception {
        when(estudianteService.actualizar(eq(1L), any()))
            .thenReturn(new EstudianteResponse(
                1L, "Ana María Pérez", "71234568", "ana.maria@ucb.edu.bo", "Medicina"
            ));

        mockMvc.perform(put("/api/estudiantes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "nombre": "Ana María Pérez",
                      "telefono": "71234568",
                      "carrera": "Medicina"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Ana María Pérez"))
            .andExpect(jsonPath("$.telefono").value("71234568"))
            .andExpect(jsonPath("$.correoElectronico").value("ana.maria@ucb.edu.bo"))
            .andExpect(jsonPath("$.carrera").value("Medicina"))
            .andExpect(jsonPath("$.contrasena").doesNotExist());

        verify(estudianteService).actualizar(eq(1L), any());
        }

        @Test
        void deberiaResponder404CuandoElEstudianteNoExiste() throws Exception {
        doThrow(new ResourceNotFoundException("Estudiante no encontrado"))
            .when(estudianteService).actualizar(eq(99L), any());

        mockMvc.perform(put("/api/estudiantes/99")
            .contentType(MediaType.APPLICATION_JSON)
            .content(cuerpoActualizacion("Ana Pérez", "71234567", "Ingeniería de Sistemas")))
            .andExpect(status().isNotFound());
        }

        @Test
        void deberiaRechazarActualizacionConNombreVacio() throws Exception {
        mockMvc.perform(put("/api/estudiantes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpoActualizacion("", "71234567", "Ingeniería")))
            .andExpect(status().isBadRequest());

        verify(estudianteService, never()).actualizar(anyLong(), any());
        }

        @Test
        void deberiaRechazarActualizacionConTelefonoInvalido() throws Exception {
        mockMvc.perform(put("/api/estudiantes/1")
                .contentType(MediaType.APPLICATION_JSON)
            .content(cuerpoActualizacion("Ana Pérez", "51234567", "Ingeniería")))
            .andExpect(status().isBadRequest());

        verify(estudianteService, never()).actualizar(anyLong(), any());
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

        private String cuerpoActualizacion(String nombre, String telefono, String carrera) {
                return """
                                {
                                    "nombre": "%s",
                                    "telefono": "%s",
                                    "carrera": "%s"
                                }
                                """.formatted(nombre, telefono, carrera);
        }
}
