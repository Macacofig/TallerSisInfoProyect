package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionDocentePromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.dto.calificacion.CalificacionDocenteResponse;
import com.unihub.backend.entity.CalificacionDocente;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.CalificacionDocenteMapper;
import com.unihub.backend.repository.CalificacionDocenteRepository;
import com.unihub.backend.repository.DocenteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

class CalificacionDocenteServiceTest {

    @Mock
    private CalificacionDocenteRepository calificacionRepository;

    @Mock
    private DocenteRepository docenteRepository;

    private CalificacionDocenteService calificacionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        calificacionService = new CalificacionDocenteService(
                calificacionRepository,
                docenteRepository,
                new CalificacionDocenteMapper()
        );
    }

    @Test
    void deberiaCrearCalificacionDeDocente() {
        Docente docente = crearDocente();
        CalificacionDocenteRequest request = new CalificacionDocenteRequest(1L, 25L, 8, 7, 9, "año-I");
        when(docenteRepository.findById(1L)).thenReturn(Optional.of(docente));
        when(calificacionRepository.save(any(CalificacionDocente.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CalificacionDocenteResponse resultado = calificacionService.crear(request);

        assertEquals(25L, resultado.idEstudiante());
        assertEquals(8, resultado.claridadExplicaciones());
        assertEquals("año-I", resultado.gestion());
        verify(docenteRepository).findById(1L);
        verify(calificacionRepository).save(any(CalificacionDocente.class));
        mostrarResultado("Crear una calificación de docente para un estudiante");
    }

    @Test
    void deberiaRechazarDocenteInexistente() {
        CalificacionDocenteRequest request = new CalificacionDocenteRequest(99L, 25L, 8, 7, 9, "año-I");
        when(docenteRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException excepcion = assertThrows(
                IllegalArgumentException.class,
                () -> calificacionService.crear(request)
        );

        assertEquals("El docente no existe", excepcion.getMessage());
        verify(calificacionRepository, never()).save(any(CalificacionDocente.class));
        mostrarResultado("Rechazar una calificación cuando el docente no existe");
    }

    @Test
    void deberiaRechazarCalificacionDuplicadaDelMismoEstudianteYDocente() {
        Docente docente = crearDocente();
        CalificacionDocenteRequest request = new CalificacionDocenteRequest(1L, 25L, 8, 7, 9, "año-I");
        when(docenteRepository.findById(1L)).thenReturn(Optional.of(docente));
        when(calificacionRepository.findFirstByIdEstudianteAndDocenteId(25L, 1L))
                .thenReturn(Optional.of(crearCalificacion(docente, 25L, 7, 7, 7, "año-I")));

        IllegalArgumentException excepcion = assertThrows(
                IllegalArgumentException.class,
                () -> calificacionService.crear(request)
        );

        assertEquals("El estudiante ya calificó a este docente", excepcion.getMessage());
        verify(calificacionRepository, never()).save(any(CalificacionDocente.class));
        mostrarResultado("Rechazar una calificación duplicada del mismo estudiante para el mismo docente");
    }

    @Test
    void deberiaCalcularPromediosDeTodasLasCalificacionesDeUnDocente() {
        Docente docente = crearDocente();
        when(calificacionRepository.findByDocenteId(1L)).thenReturn(List.of(
                crearCalificacion(docente, 10L, 8, 6, 4, "año-I"),
                crearCalificacion(docente, 11L, 6, 8, 8, "año-II")
        ));

        CalificacionDocentePromedioResponse resultado = calificacionService
                .obtenerPromediosPorDocente(1L).orElseThrow();

        assertEquals(7.0, resultado.claridadExplicacionesPromedio());
        assertEquals(7.0, resultado.metodologiaPromedio());
        assertEquals(6.0, resultado.relacionClasesEvaluacionesPromedio());
        mostrarResultado("Calcular los promedios de claridad, metodología y relación entre clases y evaluaciones");
    }

    @Test
    void deberiaObtenerUnaCalificacionPorEstudiante() {
        Docente docente = crearDocente();
        when(calificacionRepository.findFirstByIdEstudianteAndDocenteId(25L, 1L))
                .thenReturn(Optional.of(crearCalificacion(docente, 25L, 8, 6, 5, "año-I")));

        CalificacionDocenteResponse resultado = calificacionService
                .obtenerPorEstudiante(25L, 1L).orElseThrow();

        assertEquals(25L, resultado.idEstudiante());
        assertEquals(8, resultado.claridadExplicaciones());
        mostrarResultado("Obtener la calificación de un docente realizada por un estudiante");
    }

    @Test
    void deberiaDevolverVacioCuandoElEstudianteNoTieneCalificacionDelDocente() {
        when(calificacionRepository.findFirstByIdEstudianteAndDocenteId(25L, 2L))
                .thenReturn(Optional.empty());

        assertTrue(calificacionService.obtenerPorEstudiante(25L, 2L).isEmpty());
        mostrarResultado("Devolver NULL cuando el estudiante no ha calificado al docente");
    }

    @Test
    void deberiaActualizarLaCalificacionDeUnEstudiante() {
        Docente docente = crearDocente();
        CalificacionDocente calificacion = crearCalificacion(docente, 25L, 8, 6, 5, "año-I");
        CalificacionDocenteRequest request = new CalificacionDocenteRequest(1L, 25L, 10, 7, 9, "año-II");
        when(calificacionRepository.findFirstByIdEstudianteAndDocenteId(25L, 1L))
                .thenReturn(Optional.of(calificacion));
        when(calificacionRepository.save(calificacion)).thenReturn(calificacion);

        CalificacionDocenteResponse resultado = calificacionService.actualizar(25L, 1L, request).orElseThrow();

        assertEquals(10, resultado.claridadExplicaciones());
        assertEquals(7, resultado.metodologia());
        assertEquals(9, resultado.relacionClasesEvaluaciones());
        assertEquals("año-II", resultado.gestion());
        verify(calificacionRepository).save(calificacion);
        mostrarResultado("Actualizar la calificación de un estudiante sobre un docente");
    }

    @Test
    void deberiaEliminarLaCalificacionDeUnEstudiante() {
        Docente docente = crearDocente();
        CalificacionDocente calificacion = crearCalificacion(docente, 25L, 8, 6, 5, "año-I");
        when(calificacionRepository.findFirstByIdEstudianteAndDocenteId(25L, 1L))
                .thenReturn(Optional.of(calificacion));

        assertTrue(calificacionService.eliminar(25L, 1L));
        verify(calificacionRepository).delete(calificacion);
        mostrarResultado("Eliminar la calificación de un estudiante sobre un docente");
    }

    @Test
    void deberiaCalcularPromediosDeUnaGestionEspecifica() {
        Docente docente = crearDocente();
        when(calificacionRepository.findByGestion("año-I")).thenReturn(List.of(
                crearCalificacion(docente, 10L, 8, 6, 4, "año-I"),
                crearCalificacion(docente, 11L, 10, 8, 6, "año-I")
        ));

        CalificacionDocentePromedioResponse resultado = calificacionService
                .obtenerPromediosPorGestion("año-I").orElseThrow();

        assertEquals("año-I", resultado.gestionDesde());
        assertEquals(9.0, resultado.claridadExplicacionesPromedio());
        assertEquals(7.0, resultado.metodologiaPromedio());
        mostrarResultado("Calcular los promedios de una gestión específica para docentes");
    }

    @Test
    void deberiaObtenerGestionesSinRepetirlas() {
        Docente docente = crearDocente();
        when(calificacionRepository.findAllByOrderByGestionAsc()).thenReturn(List.of(
                crearCalificacion(docente, 10L, 8, 6, 4, "año-I"),
                crearCalificacion(docente, 11L, 10, 8, 6, "año-I"),
                crearCalificacion(docente, 12L, 7, 7, 7, "año-II")
        ));

        assertEquals(List.of("año-I", "año-II"), calificacionService.obtenerGestiones());
        mostrarResultado("Obtener las gestiones de docentes disponibles sin repetirlas");
    }

    @Test
    void deberiaCalcularPromediosDeUnRangoDeGestiones() {
        Docente docente = crearDocente();
        when(calificacionRepository.findByGestionBetween("año-I", "año-II")).thenReturn(List.of(
                crearCalificacion(docente, 10L, 8, 6, 4, "año-I"),
                crearCalificacion(docente, 11L, 10, 8, 6, "año-II")
        ));

        CalificacionDocentePromedioResponse resultado = calificacionService
                .obtenerPromediosPorRango("año-I", "año-II").orElseThrow();

        assertEquals("año-I", resultado.gestionDesde());
        assertEquals("año-II", resultado.gestionHasta());
        assertEquals(9.0, resultado.claridadExplicacionesPromedio());
        assertEquals(5.0, resultado.relacionClasesEvaluacionesPromedio());
        mostrarResultado("Calcular los promedios dentro de un rango de gestiones docentes");
    }

    private Docente crearDocente() {
        return new Docente("Ana Docente", new Materia("INF101", "Programacion I", "Ingenieria de Sistemas", 1));
    }

    private CalificacionDocente crearCalificacion(
            Docente docente,
            Long idEstudiante,
            int claridadExplicaciones,
            int metodologia,
            int relacionClasesEvaluaciones,
            String gestion
    ) {
        return new CalificacionDocente(
                docente,
                idEstudiante,
                claridadExplicaciones,
                metodologia,
                relacionClasesEvaluaciones,
                gestion
        );
    }

    private void mostrarResultado(String descripcion) {
        System.out.println("-----------------------------");
        System.out.println(descripcion);
        System.out.println("Resultado: OK");
        System.out.println("-----------------------------");
    }
}