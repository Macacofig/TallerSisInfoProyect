package com.unihub.backend.service;

import com.unihub.backend.dto.actividad.ActividadEstudianteActualizacionRequest;
import com.unihub.backend.dto.actividad.ActividadEstudianteRequest;
import com.unihub.backend.dto.actividad.ActividadEstudianteResponse;
import com.unihub.backend.entity.ActividadEstudiante;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.ActividadEstudianteMapper;
import com.unihub.backend.repository.ActividadEstudianteRepository;
import com.unihub.backend.repository.EstudianteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActividadEstudianteServiceTest {

    @Mock
    private ActividadEstudianteRepository actividadRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    private ActividadEstudianteService actividadService;

    @BeforeEach
    void setUp() {
        actividadService = new ActividadEstudianteService(
                actividadRepository,
                estudianteRepository,
                new ActividadEstudianteMapper()
        );
    }

    @Test
    void deberiaRegistrarActividadAlCalificarMateria() {
        Estudiante estudiante = estudiante(1L);

        actividadService.registrarCalificacionMateria(estudiante);

        ActividadEstudiante actividad = capturarActividadGuardada();
        assertEquals("Calificar materia", actividad.getTitulo());
        assertEquals("Calificación a materia", actividad.getDescripcion());
        assertEquals(ActividadEstudiante.EstadoActividad.REALIZADO, actividad.getEstado());
        assertNotNull(actividad.getFechaHoraRegistro());
        assertEquals(estudiante, actividad.getEstudiante());
    }

    @Test
    void deberiaRegistrarActividadAlCalificarDocente() {
        actividadService.registrarCalificacionDocente(estudiante(2L));

        ActividadEstudiante actividad = capturarActividadGuardada();
        assertEquals("Calificar docente", actividad.getTitulo());
        assertEquals("Calificación a docente", actividad.getDescripcion());
        assertEquals(ActividadEstudiante.EstadoActividad.REALIZADO, actividad.getEstado());
    }

    @Test
    void deberiaRegistrarActividadPendienteAlSolicitarSerAyudante() {
        Materia materia = materia(5L, "Programación I");

        actividadService.registrarSolicitudAyudante(estudiante(3L), materia);

        ActividadEstudiante actividad = capturarActividadGuardada();
        assertEquals("Solicitar ser ayudante en Programación I", actividad.getTitulo());
        assertEquals("Solicitud enviada a ser probada", actividad.getDescripcion());
        assertEquals(ActividadEstudiante.EstadoActividad.PENDIENTE, actividad.getEstado());
    }

    @Test
    void deberiaActualizarEstadoDeLaSolicitudPendiente() {
        Estudiante estudiante = estudiante(4L);
        Materia materia = materia(6L, "Cálculo I");
        ActividadEstudiante actividad = new ActividadEstudiante(
                estudiante,
                "Solicitar ser ayudante en Cálculo I",
                "Solicitud enviada a ser probada",
                LocalDateTime.now(),
                ActividadEstudiante.EstadoActividad.PENDIENTE
        );
        when(actividadRepository.findFirstByEstudianteIdAndTituloAndEstadoOrderByFechaHoraRegistroDesc(
                4L, "Solicitar ser ayudante en Cálculo I", ActividadEstudiante.EstadoActividad.PENDIENTE))
                .thenReturn(Optional.of(actividad));

        actividadService.actualizarEstadoSolicitudAyudante(
                estudiante, materia, ActividadEstudiante.EstadoActividad.APROBADA);

        assertEquals(ActividadEstudiante.EstadoActividad.APROBADA, actividad.getEstado());
        verify(actividadRepository).save(actividad);
    }

    @Test
    void deberiaInsertarActividadDesdeElEndpoint() {
        Estudiante estudiante = estudiante(7L);
        when(estudianteRepository.findById(7L)).thenReturn(Optional.of(estudiante));
        when(actividadRepository.save(any(ActividadEstudiante.class))).thenAnswer(invocation -> {
            ActividadEstudiante actividad = invocation.getArgument(0);
            ReflectionTestUtils.setField(actividad, "id", 10L);
            return actividad;
        });

        ActividadEstudianteResponse response = actividadService.insertar(new ActividadEstudianteRequest(
                7L,
                "Actividad manual",
                "Descripción manual",
                ActividadEstudiante.EstadoActividad.REALIZADO
        ));

        assertEquals(10L, response.id());
        assertEquals(7L, response.idEstudiante());
        assertEquals("Actividad manual", response.titulo());
        assertEquals("REALIZADO", response.estado());
    }

    @Test
    void deberiaActualizarUnaActividadExistente() {
        ActividadEstudiante actividad = new ActividadEstudiante(
                estudiante(8L), "Título anterior", "Descripción anterior", LocalDateTime.now(),
                ActividadEstudiante.EstadoActividad.PENDIENTE);
        when(actividadRepository.findById(20L)).thenReturn(Optional.of(actividad));
        when(actividadRepository.save(actividad)).thenReturn(actividad);

        ActividadEstudianteResponse response = actividadService.actualizar(20L,
                new ActividadEstudianteActualizacionRequest(
                        "Título nuevo", "Descripción nueva", ActividadEstudiante.EstadoActividad.APROBADA));

        assertEquals("Título nuevo", response.titulo());
        assertEquals("Descripción nueva", response.descripcion());
        assertEquals("APROBADA", response.estado());
    }

    @Test
    void deberiaMostrarActividadesPorEstudiante() {
        Estudiante estudiante = estudiante(9L);
        ActividadEstudiante primera = new ActividadEstudiante(
                estudiante, "Primera", "Descripción", LocalDateTime.now(), ActividadEstudiante.EstadoActividad.REALIZADO);
        ActividadEstudiante segunda = new ActividadEstudiante(
                estudiante, "Segunda", "Descripción", LocalDateTime.now(), ActividadEstudiante.EstadoActividad.REALIZADO);
        when(estudianteRepository.existsById(9L)).thenReturn(true);
        when(actividadRepository.findByEstudianteIdOrderByFechaHoraRegistroDesc(9L))
                .thenReturn(List.of(primera, segunda));

        List<ActividadEstudianteResponse> response = actividadService.obtenerPorEstudiante(9L);

        assertEquals(2, response.size());
        assertEquals("Primera", response.get(0).titulo());
    }

    @Test
    void deberiaRechazarConsultaCuandoElEstudianteNoExiste() {
        when(estudianteRepository.existsById(99L)).thenReturn(false);

        ResourceNotFoundException excepcion = assertThrows(
                ResourceNotFoundException.class,
                () -> actividadService.obtenerPorEstudiante(99L)
        );

        assertEquals("El estudiante no existe", excepcion.getMessage());
        verify(actividadRepository, never()).findByEstudianteIdOrderByFechaHoraRegistroDesc(99L);
    }

    private ActividadEstudiante capturarActividadGuardada() {
        ArgumentCaptor<ActividadEstudiante> captor = ArgumentCaptor.forClass(ActividadEstudiante.class);
        verify(actividadRepository).save(captor.capture());
        return captor.getValue();
    }

    private Estudiante estudiante(Long id) {
        Estudiante estudiante = new Estudiante(
                "Estudiante " + id, "pass", "77700000", "estudiante" + id + "@ucb.edu.bo", "Ingeniería");
        ReflectionTestUtils.setField(estudiante, "id", id);
        return estudiante;
    }

    private Materia materia(Long id, String nombre) {
        Materia materia = new Materia("MAT" + id, nombre, "Ingeniería", 1);
        ReflectionTestUtils.setField(materia, "id", id);
        return materia;
    }
}
