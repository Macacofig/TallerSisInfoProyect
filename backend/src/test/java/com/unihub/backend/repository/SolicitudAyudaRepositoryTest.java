package com.unihub.backend.repository;

import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudAyuda;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class SolicitudAyudaRepositoryTest {

    @Mock
    private SolicitudAyudaRepository repository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void deberiaGuardarYBuscarPorAyudante() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Estudiante ayudanteEst = new Estudiante("Ayudante", "pass", "77700001", "ayudante@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST301", "Test Materia", "ingeniería en sistemas", 1);

        AyudanteMateria ayudante = new AyudanteMateria(ayudanteEst, materia, "Lunes 10-12");
        ayudante.aprobar();

        SolicitudAyuda s1 = new SolicitudAyuda(estudiante, ayudante, materia, "Ayuda 1");
        SolicitudAyuda s2 = new SolicitudAyuda(estudiante, ayudante, materia, "Ayuda 2");

        when(repository.findByAyudanteId(ayudante.getId())).thenReturn(List.of(s1, s2));

        List<SolicitudAyuda> resultado = repository.findByAyudanteId(ayudante.getId());
        assertEquals(2, resultado.size());
    }

    @Test
    void deberiaBuscarPorEstudiante() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Estudiante ayudanteEst = new Estudiante("Ayudante", "pass", "77700001", "ayudante@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST302", "Test Materia", "ingeniería en sistemas", 1);

        AyudanteMateria ayudante = new AyudanteMateria(ayudanteEst, materia, "Lunes 10-12");
        ayudante.aprobar();

        SolicitudAyuda s1 = new SolicitudAyuda(estudiante, ayudante, materia, "Ayuda 1");
        SolicitudAyuda s2 = new SolicitudAyuda(estudiante, ayudante, new Materia("TEST303", "Test Materia 2", "ingeniería en sistemas", 1), "Ayuda 2");

        when(repository.findByEstudianteId(estudiante.getId())).thenReturn(List.of(s1, s2));

        List<SolicitudAyuda> resultado = repository.findByEstudianteId(estudiante.getId());
        assertEquals(2, resultado.size());
    }

    @Test
    void deberiaBuscarPorMateria() {
        Estudiante estudiante1 = new Estudiante("Test1", "pass", "77700000", "test1@test.com", "ingeniería en sistemas");
        Estudiante estudiante2 = new Estudiante("Test2", "pass", "77700001", "test2@test.com", "ingeniería en sistemas");
        Estudiante ayudanteEst = new Estudiante("Ayudante", "pass", "77700002", "ayudante@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST304", "Test Materia", "ingeniería en sistemas", 1);

        AyudanteMateria ayudante = new AyudanteMateria(ayudanteEst, materia, "Lunes 10-12");
        ayudante.aprobar();

        SolicitudAyuda s1 = new SolicitudAyuda(estudiante1, ayudante, materia, "Ayuda 1");
        SolicitudAyuda s2 = new SolicitudAyuda(estudiante2, ayudante, materia, "Ayuda 2");

        when(repository.findByMateriaId(materia.getId())).thenReturn(List.of(s1, s2));

        List<SolicitudAyuda> resultado = repository.findByMateriaId(materia.getId());
        assertEquals(2, resultado.size());
    }

    @Test
    void deberiaBuscarPorAyudanteYEstado() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Estudiante ayudanteEst = new Estudiante("Ayudante", "pass", "77700001", "ayudante@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST305", "Test Materia", "ingeniería en sistemas", 1);

        AyudanteMateria ayudante = new AyudanteMateria(ayudanteEst, materia, "Lunes 10-12");
        ayudante.aprobar();

        SolicitudAyuda s1 = new SolicitudAyuda(estudiante, ayudante, materia, "Ayuda pendiente");
        SolicitudAyuda s2 = new SolicitudAyuda(estudiante, ayudante, materia, "Ayuda resuelta");
        s2.resolver();

        when(repository.findByAyudanteIdAndEstado(ayudante.getId(), SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE))
                .thenReturn(List.of(s1));

        List<SolicitudAyuda> pendientes = repository.findByAyudanteIdAndEstado(ayudante.getId(), SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE);
        assertEquals(1, pendientes.size());
        assertEquals(SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE, pendientes.get(0).getEstado());
    }

    @Test
    void deberiaBuscarPorEstado() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Estudiante ayudanteEst = new Estudiante("Ayudante", "pass", "77700001", "ayudante@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST306", "Test Materia", "ingeniería en sistemas", 1);

        AyudanteMateria ayudante = new AyudanteMateria(ayudanteEst, materia, "Lunes 10-12");
        ayudante.aprobar();

        SolicitudAyuda s1 = new SolicitudAyuda(estudiante, ayudante, materia, "Ayuda pendiente");
        SolicitudAyuda s2 = new SolicitudAyuda(estudiante, ayudante, materia, "Ayuda resuelta");
        s2.resolver();

        when(repository.findByEstado(SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE)).thenReturn(List.of(s1));

        List<SolicitudAyuda> pendientes = repository.findByEstado(SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE);
        assertEquals(1, pendientes.size());
        assertEquals(SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE, pendientes.get(0).getEstado());
    }
}