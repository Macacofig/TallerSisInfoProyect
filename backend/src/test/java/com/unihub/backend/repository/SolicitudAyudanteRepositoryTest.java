package com.unihub.backend.repository;

import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudAyudante;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class SolicitudAyudanteRepositoryTest {

    @Mock
    private SolicitudAyudanteRepository repository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void deberiaGuardarYBuscarPorEstudiante() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST201", "Test Materia", "ingeniería en sistemas", 1);

        SolicitudAyudante s1 = new SolicitudAyudante(estudiante, materia, "Motivo 1", 8.5, "Lunes 10-12");
        SolicitudAyudante s2 = new SolicitudAyudante(estudiante, new Materia("TEST202", "Test Materia 2", "ingeniería en sistemas", 1), "Motivo 2", 9.0, "Martes 10-12");

        when(repository.findByEstudianteId(estudiante.getId())).thenReturn(List.of(s1, s2));

        List<SolicitudAyudante> resultado = repository.findByEstudianteId(estudiante.getId());
        assertEquals(2, resultado.size());
    }

    @Test
    void deberiaBuscarPorMateria() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST203", "Test Materia", "ingeniería en sistemas", 1);

        SolicitudAyudante s1 = new SolicitudAyudante(estudiante, materia, "Motivo 1", 8.5, "Lunes 10-12");
        SolicitudAyudante s2 = new SolicitudAyudante(new Estudiante("Test2", "pass", "77700001", "test2@test.com", "ingeniería en sistemas"), materia, "Motivo 2", 9.0, "Martes 10-12");

        when(repository.findByMateriaId(materia.getId())).thenReturn(List.of(s1, s2));

        List<SolicitudAyudante> resultado = repository.findByMateriaId(materia.getId());
        assertEquals(2, resultado.size());
    }

    @Test
    void deberiaBuscarPorEstado() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST204", "Test Materia", "ingeniería en sistemas", 1);

        SolicitudAyudante s1 = new SolicitudAyudante(estudiante, materia, "Motivo 1", 8.5, "Lunes 10-12");
        SolicitudAyudante s2 = new SolicitudAyudante(estudiante, new Materia("TEST205", "Test Materia 2", "ingeniería en sistemas", 1), "Motivo 2", 9.0, "Martes 10-12");
        s2.aprobar();

        when(repository.findByEstado(SolicitudAyudante.EstadoSolicitud.PENDIENTE)).thenReturn(List.of(s1));

        List<SolicitudAyudante> pendientes = repository.findByEstado(SolicitudAyudante.EstadoSolicitud.PENDIENTE);
        assertEquals(1, pendientes.size());
        assertEquals(SolicitudAyudante.EstadoSolicitud.PENDIENTE, pendientes.get(0).getEstado());
    }

    @Test
    void deberiaVerificarExistenciaPorEstudianteMateriaYEstados() {
        Estudiante estudiante = new Estudiante("Test", "pass", "77700000", "test@test.com", "ingeniería en sistemas");
        Materia materia = new Materia("TEST206", "Test Materia", "ingeniería en sistemas", 1);

        SolicitudAyudante s = new SolicitudAyudante(estudiante, materia, "Motivo", 8.5, "Lunes 10-12");

        when(repository.existsByEstudianteIdAndMateriaIdAndEstadoIn(
                estudiante.getId(), materia.getId(),
                List.of(SolicitudAyudante.EstadoSolicitud.PENDIENTE, SolicitudAyudante.EstadoSolicitud.APROBADA)))
                .thenReturn(true);

        boolean existe = repository.existsByEstudianteIdAndMateriaIdAndEstadoIn(
                estudiante.getId(), materia.getId(),
                List.of(SolicitudAyudante.EstadoSolicitud.PENDIENTE, SolicitudAyudante.EstadoSolicitud.APROBADA));
        assertTrue(existe);
    }
}