package com.unihub.backend.controller;

import com.unihub.backend.dto.materia.MateriaResponse;
import com.unihub.backend.service.MateriaService;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MateriaController.class)
class MateriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MateriaService materiaService;

        private static int numeroPrueba;

    private MateriaResponse materia(long id, String codigo, String nombre, String carrera, int semestre) {
        return new MateriaResponse(id, codigo, nombre, carrera, semestre);
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

    private void verificarRespuestaJson(int cantidad) throws Exception {
        mockMvc.perform(get("/api/materias").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.size()").value(cantidad));
    }

    @Test
    void deberiaRetornarTodasLasMaterias() throws Exception {
        when(materiaService.obtenerMaterias(null, null, null)).thenReturn(List.of(
                materia(1, "INF101", "Programación I", "Ingeniería de Sistemas", 1),
                materia(2, "INF202", "Base de Datos", "Ingeniería de Sistemas", 3)
        ));

        mockMvc.perform(get("/api/materias").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].codigo").value("INF101"))
                .andExpect(jsonPath("$[0].nombre").value("Programación I"))
                .andExpect(jsonPath("$[1].nombre").value("Base de Datos"));

        verify(materiaService).obtenerMaterias(null, null, null);
        mostrarResultado("Mostrar todas las materias");
    }

    @Test
    void deberiaRetornarListaVacia() throws Exception {
        when(materiaService.obtenerMaterias(null, null, null)).thenReturn(List.of());

        verificarRespuestaJson(0);

        verify(materiaService).obtenerMaterias(null, null, null);
        mostrarResultado("Mostrar lista vacía (no hay materias)");
    }

    @Test
    void deberiaFiltrarPorNombre() throws Exception {
        when(materiaService.obtenerMaterias("Programación", null, null)).thenReturn(List.of(
                materia(1, "INF101", "Programación I", "Ingeniería de Sistemas", 1)
        ));

        mockMvc.perform(get("/api/materias").param("nombre", "Programación"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Programación I"));

        verify(materiaService).obtenerMaterias("Programación", null, null);
        mostrarResultado("Mostrar materias por nombre");
    }

    @Test
    void deberiaFiltrarPorCarrera() throws Exception {
        when(materiaService.obtenerMaterias(null, "Ingeniería de Sistemas", null)).thenReturn(List.of(
                materia(1, "INF101", "Programación I", "Ingeniería de Sistemas", 1)
        ));

        mockMvc.perform(get("/api/materias").param("carrera", "Ingeniería de Sistemas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].carrera").value("Ingeniería de Sistemas"));

        verify(materiaService).obtenerMaterias(null, "Ingeniería de Sistemas", null);
        mostrarResultado("Mostrar materias por carrera");
    }

    @Test
    void deberiaFiltrarPorSemestre() throws Exception {
        when(materiaService.obtenerMaterias(null, null, 3)).thenReturn(List.of(
                materia(2, "INF202", "Base de Datos", "Ingeniería de Sistemas", 3)
        ));

        mockMvc.perform(get("/api/materias").param("semestre", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].semestre").value(3));

        verify(materiaService).obtenerMaterias(null, null, 3);
        mostrarResultado("Mostrar materias por semestre");
    }

    @Test
    void deberiaFiltrarPorNombreCarreraYSemestre() throws Exception {
        when(materiaService.obtenerMaterias("Programación", "Ingeniería de Sistemas", 1)).thenReturn(List.of(
                materia(1, "INF101", "Programación I", "Ingeniería de Sistemas", 1)
        ));

        mockMvc.perform(get("/api/materias")
                        .param("nombre", "Programación")
                        .param("carrera", "Ingeniería de Sistemas")
                        .param("semestre", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Programación I"))
                .andExpect(jsonPath("$[0].carrera").value("Ingeniería de Sistemas"))
                .andExpect(jsonPath("$[0].semestre").value(1));

        verify(materiaService).obtenerMaterias("Programación", "Ingeniería de Sistemas", 1);
        mostrarResultado("Mostrar materias por nombre, carrera y semestre");
    }
}
