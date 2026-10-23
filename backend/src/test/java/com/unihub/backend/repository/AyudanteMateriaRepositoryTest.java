package com.unihub.backend.repository;

import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class AyudanteMateriaRepositoryTest {

    @Mock
    private AyudanteMateriaRepository repository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void deberiaGuardarYBuscarPorMateriaYEstado() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST101", "Test Materia", "ingeniería en sistemas", 1);

        AyudanteMateria am1 = new AyudanteMateria(estudiante, materia, "Lunes 10-12");
        am1.aprobar();
        AyudanteMateria am2 = new AyudanteMateria(new Estudiante("Test2", "pass", "77700001", "test2@test.com", "ingeniería en sistemas"), materia, "Martes 10-12");

        when(repository.findByMateriaIdAndEstado(materia.getId(), AyudanteMateria.EstadoAyudante.APROBADO))
                .thenReturn(List.of(am1));

        List<AyudanteMateria> aprobados = repository.findByMateriaIdAndEstado(materia.getId(), AyudanteMateria.EstadoAyudante.APROBADO);
        assertEquals(1, aprobados.size());
        assertEquals(AyudanteMateria.EstadoAyudante.APROBADO, aprobados.get(0).getEstado());
    }

    @Test
    void deberiaBuscarPorEstudiante() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST102", "Test Materia", "ingeniería en sistemas", 1);

        AyudanteMateria am1 = new AyudanteMateria(estudiante, materia, "Lunes 10-12");
        AyudanteMateria am2 = new AyudanteMateria(estudiante, new Materia("TEST103", "Test Materia 2", "ingeniería en sistemas", 1), "Martes 10-12");

        when(repository.findByEstudianteId(estudiante.getId())).thenReturn(List.of(am1, am2));

        List<AyudanteMateria> resultado = repository.findByEstudianteId(estudiante.getId());
        assertEquals(2, resultado.size());
    }

    @Test
    void deberiaBuscarPorEstudianteMateriaYEstado() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST104", "Test Materia", "ingeniería en sistemas", 1);

        AyudanteMateria am = new AyudanteMateria(estudiante, materia, "Lunes 10-12");
        am.aprobar();

        when(repository.findByEstudianteIdAndMateriaIdAndEstado(estudiante.getId(), materia.getId(), AyudanteMateria.EstadoAyudante.APROBADO))
                .thenReturn(am);

        AyudanteMateria encontrado = repository.findByEstudianteIdAndMateriaIdAndEstado(
                estudiante.getId(), materia.getId(), AyudanteMateria.EstadoAyudante.APROBADO);
        assertNotNull(encontrado);
        assertEquals(am, encontrado);
    }

    @Test
    void deberiaVerificarExistenciaPorEstudianteMateriaYEstados() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST105", "Test Materia", "ingeniería en sistemas", 1);

        AyudanteMateria am = new AyudanteMateria(estudiante, materia, "Lunes 10-12");

        when(repository.existsByEstudianteIdAndMateriaIdAndEstadoIn(
                estudiante.getId(), materia.getId(),
                List.of(AyudanteMateria.EstadoAyudante.PENDIENTE, AyudanteMateria.EstadoAyudante.APROBADO)))
                .thenReturn(true);

        boolean existe = repository.existsByEstudianteIdAndMateriaIdAndEstadoIn(
                estudiante.getId(), materia.getId(),
                List.of(AyudanteMateria.EstadoAyudante.PENDIENTE, AyudanteMateria.EstadoAyudante.APROBADO));
        assertTrue(existe);
    }
}