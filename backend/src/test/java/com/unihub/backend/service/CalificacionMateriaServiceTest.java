package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionMateriaRequest;
import com.unihub.backend.dto.calificacion.CalificacionMateriaPromedioResponse;
import com.unihub.backend.dto.calificacion.CalificacionMateriaResponse;
import com.unihub.backend.entity.CalificacionMateria;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.CalificacionMateriaMapper;
import com.unihub.backend.repository.CalificacionMateriaRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CalificacionMateriaServiceTest {

    @Mock
    private CalificacionMateriaRepository calificacionRepository;

    @Mock
    private MateriaRepository materiaRepository;

    private CalificacionMateriaService calificacionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        calificacionService = new CalificacionMateriaService(
                calificacionRepository,
                materiaRepository,
                new CalificacionMateriaMapper()
        );
    }

    @Test
    void deberiaCrearCalificacionConEstudianteOpcional() {
        Materia materia = new Materia(
                "INF101",
                "Programacion I",
                "Ingenieria de Sistemas",
                1
        );
        CalificacionMateriaRequest request = new CalificacionMateriaRequest(
                1L,
                null,
                8,
                6,
                5,
                List.of("Matematicas", "Logica"),
                "Practico",
                "I-Año"
        );

        when(materiaRepository.findById(1L)).thenReturn(Optional.of(materia));
        when(calificacionRepository.save(any(CalificacionMateria.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CalificacionMateriaResponse resultado = calificacionService.crear(request);

        assertNull(resultado.idEstudiante());
        assertEquals("Matematicas,Logica", resultado.prerequisitosText());
        assertEquals("Practico", resultado.predominio());
        assertEquals("I-Año", resultado.gestion());
        verify(materiaRepository).findById(1L);
        verify(calificacionRepository).save(any(CalificacionMateria.class));
        mostrarResultado("Crear calificación de una materia con estudiante opcional");
    }

    @Test
    void deberiaRechazarMateriaInexistente() {
        CalificacionMateriaRequest request = new CalificacionMateriaRequest(
                99L,
                null,
                8,
                6,
                5,
                List.of("Matematicas"),
                "Teorico",
                "II-Año"
        );
        when(materiaRepository.findById(99L)).thenReturn(Optional.empty());

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> calificacionService.crear(request)
        );

        mostrarResultado("Rechazar calificación cuando la materia no existe");
    }

    @Test
    void deberiaCalcularPromediosDeTodasLasCalificacionesDeUnaMateria() {
        Materia materia = crearMateria();
        when(calificacionRepository.findByMateriaId(1L)).thenReturn(List.of(
                crearCalificacion(materia, 10L, 8, 6, 4, "I-Año"),
                crearCalificacion(materia, 11L, 6, 8, 8, "II-Año")
        ));

        CalificacionMateriaPromedioResponse resultado = calificacionService
                .obtenerPromediosPorMateria(1L)
                .orElseThrow();

        assertEquals(7.0, resultado.dificultadPromedio());
        assertEquals(7.0, resultado.cargaPromedio());
        assertEquals(6.0, resultado.conocimientoPrevioPromedio());
        mostrarResultado("Calcular los promedios de todas las calificaciones de una materia");
    }

    @Test
    void deberiaObtenerUnaCalificacionPorEstudiante() {
        Materia materia = crearMateria();
        CalificacionMateria calificacion = crearCalificacion(materia, 25L, 8, 6, 5, "I-Año");
        when(calificacionRepository.findFirstByIdEstudianteAndMateriaId(25L, 1L))
                .thenReturn(Optional.of(calificacion));

        CalificacionMateriaResponse resultado = calificacionService
                .obtenerPorEstudiante(25L, 1L)
                .orElseThrow();

        assertEquals(25L, resultado.idEstudiante());
        assertEquals(8, resultado.dificultad());
        mostrarResultado("Obtener una calificación perteneciente a un estudiante");
    }

        @Test
        void deberiaDevolverVacioCuandoElEstudianteNoTieneCalificacionEnLaMateria() {
                when(calificacionRepository.findFirstByIdEstudianteAndMateriaId(25L, 2L))
                                .thenReturn(Optional.empty());

                assertTrue(calificacionService.obtenerPorEstudiante(25L, 2L).isEmpty());
                mostrarResultado("Devolver NULL cuando el estudiante no tiene calificación para la materia solicitada");
        }

    @Test
    void deberiaCalcularPromediosDeUnaGestionEspecifica() {
        Materia materia = crearMateria();
        when(calificacionRepository.findByGestion("I-Año")).thenReturn(List.of(
                crearCalificacion(materia, 10L, 8, 6, 4, "I-Año"),
                crearCalificacion(materia, 11L, 10, 8, 6, "I-Año")
        ));

        CalificacionMateriaPromedioResponse resultado = calificacionService
                .obtenerPromediosPorGestion("I-Año")
                .orElseThrow();

        assertEquals("I-Año", resultado.gestionDesde());
        assertEquals(9.0, resultado.dificultadPromedio());
        assertEquals(7.0, resultado.cargaPromedio());
        mostrarResultado("Calcular los promedios de una gestión específica");
    }

    @Test
    void deberiaObtenerGestionesSinRepetirlas() {
        Materia materia = crearMateria();
        when(calificacionRepository.findAllByOrderByGestionAsc()).thenReturn(List.of(
                crearCalificacion(materia, 10L, 8, 6, 4, "I-Año"),
                crearCalificacion(materia, 11L, 10, 8, 6, "I-Año"),
                crearCalificacion(materia, 12L, 7, 7, 7, "II-Año")
        ));

        List<String> gestiones = calificacionService.obtenerGestiones();

        assertEquals(List.of("I-Año", "II-Año"), gestiones);
        mostrarResultado("Obtener las gestiones disponibles sin valores repetidos");
    }

    @Test
    void deberiaCalcularPromediosDeUnRangoDeGestiones() {
        Materia materia = crearMateria();
        when(calificacionRepository.findByGestionBetween("I-Año", "II-Año")).thenReturn(List.of(
                crearCalificacion(materia, 10L, 8, 6, 4, "I-Año"),
                crearCalificacion(materia, 11L, 10, 8, 6, "II-Año")
        ));

        CalificacionMateriaPromedioResponse resultado = calificacionService
                .obtenerPromediosPorRango("I-Año", "II-Año")
                .orElseThrow();

        assertEquals("I-Año", resultado.gestionDesde());
        assertEquals("II-Año", resultado.gestionHasta());
        assertEquals(9.0, resultado.dificultadPromedio());
        assertEquals(5.0, resultado.conocimientoPrevioPromedio());
        mostrarResultado("Calcular los promedios dentro de un rango de gestiones");
    }

    private Materia crearMateria() {
        return new Materia("INF101", "Programacion I", "Ingenieria de Sistemas", 1);
    }

    private CalificacionMateria crearCalificacion(
            Materia materia,
            Long idEstudiante,
            int dificultad,
            int carga,
            int conocimientoPrevio,
            String gestion
    ) {
        return new CalificacionMateria(
                materia,
                idEstudiante,
                dificultad,
                carga,
                conocimientoPrevio,
                "Matematicas",
                "Practico",
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
