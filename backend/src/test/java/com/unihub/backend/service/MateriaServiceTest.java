package com.unihub.backend.service;

import com.unihub.backend.dto.materia.MateriaResponse;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.MateriaMapper;
import com.unihub.backend.repository.MateriaRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.data.jpa.domain.Specification;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@TestMethodOrder(OrderAnnotation.class)
class MateriaServiceTest {

    @Mock
    private MateriaRepository materiaRepository;

    private MateriaService materiaService;
    private static int numeroPrueba;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        materiaService = new MateriaService(materiaRepository, new MateriaMapper());
        numeroPrueba++;
    }

    private Materia materia(String codigo, String nombre, String carrera, int semestre) {
        return new Materia(codigo, nombre, carrera, semestre);
    }

    private void configurarMaterias(Materia... materias) {
        when(materiaRepository.findAll(any(Specification.class))).thenReturn(List.of(materias));
    }

    private List<MateriaResponse> obtener(String nombre, String carrera, Integer semestre) {
        return materiaService.obtenerMaterias(nombre, carrera, semestre);
    }

    private void verificarConsulta() {
        verify(materiaRepository).findAll(any(Specification.class));
    }

    private void mostrarResultado(String descripcion) {
        System.out.println("-----------------------------");
        System.out.println("PRUEBA " + numeroPrueba);
        System.out.println("-----------------------------");
        System.out.println(descripcion);
        System.out.println("Resultado: OK");
        System.out.println("-----------------------------");
    }

    @Test
    @Order(1)
    void deberiaRetornarTodasLasMaterias() {
        configurarMaterias(
                materia("INF101", "Programación I", "Ingeniería de Sistemas", 1),
                materia("INF202", "Base de Datos", "Ingeniería de Sistemas", 3)
        );

        List<MateriaResponse> resultado = obtener(null, null, null);

        assertEquals(2, resultado.size());
        verificarConsulta();
        mostrarResultado("Mostrar todas las materias");
    }

    @Test
    @Order(2)
    void deberiaRetornarListaVaciaCuandoNoExistenMaterias() {
        configurarMaterias();

        List<MateriaResponse> resultado = obtener(null, null, null);

        assertTrue(resultado.isEmpty());
        verificarConsulta();
        mostrarResultado("Mostrar lista vacía (no hay materias)");
    }

    @Test
    @Order(3)
    void deberiaFiltrarPorNombre() {
        configurarMaterias(materia("INF101", "Programación I", "Ingeniería de Sistemas", 1));

        List<MateriaResponse> resultado = obtener("Programación", null, null);

        assertEquals("Programación I", resultado.getFirst().nombre());
        verificarConsulta();
        mostrarResultado("Mostrar materias por nombre");
    }

    @Test
    @Order(4)
    void deberiaFiltrarPorSemestre() {
        configurarMaterias(materia("INF202", "Base de Datos", "Ingeniería de Sistemas", 3));

        List<MateriaResponse> resultado = obtener(null, null, 3);

        assertEquals(3, resultado.getFirst().semestre());
        verificarConsulta();
        mostrarResultado("Mostrar materias por semestre");
    }

    @Test
    @Order(5)
    void deberiaFiltrarPorCarrera() {
        configurarMaterias(materia("INF202", "Base de Datos", "Ingeniería de Sistemas", 3));

        List<MateriaResponse> resultado = obtener(null, "Ingeniería de Sistemas", null);

        assertEquals("Ingeniería de Sistemas", resultado.getFirst().carrera());
        verificarConsulta();
        mostrarResultado("Mostrar materias por carrera");
    }

    @Test
    @Order(6)
    void deberiaFiltrarPorNombreYSemestre() {
        configurarMaterias(materia("INF101", "Programación I", "Ingeniería de Sistemas", 1));

        List<MateriaResponse> resultado = obtener("Programación", null, 1);

        assertEquals(1, resultado.size());
        verificarConsulta();
        mostrarResultado("Mostrar materias por nombre y semestre");
    }

    @Test
    @Order(7)
    void deberiaFiltrarPorNombreYCarrera() {
        configurarMaterias(materia("INF101", "Programación I", "Ingeniería de Sistemas", 1));

        List<MateriaResponse> resultado = obtener("Programación", "Ingeniería de Sistemas", null);

        assertEquals(1, resultado.size());
        verificarConsulta();
        mostrarResultado("Mostrar materias por nombre y carrera");
    }

    @Test
    @Order(8)
    void deberiaFiltrarPorSemestreYCarrera() {
        configurarMaterias(materia("INF101", "Programación I", "Ingeniería de Sistemas", 1));

        List<MateriaResponse> resultado = obtener(null, "Ingeniería de Sistemas", 1);

        assertEquals(1, resultado.size());
        verificarConsulta();
        mostrarResultado("Mostrar materias por semestre y carrera");
    }

    @Test
    @Order(9)
    void deberiaFiltrarPorNombreCarreraYSemestre() {
        configurarMaterias(materia("INF101", "Programación I", "Ingeniería de Sistemas", 1));

        List<MateriaResponse> resultado = obtener("Programación", "Ingeniería de Sistemas", 1);

        assertEquals(1, resultado.size());
        assertEquals("Programación I", resultado.getFirst().nombre());
        verificarConsulta();
        mostrarResultado("Mostrar materias por materia, nombre y carrera");
    }
}
