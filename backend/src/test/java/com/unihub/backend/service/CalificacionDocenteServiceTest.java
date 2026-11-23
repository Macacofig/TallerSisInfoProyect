package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.dto.calificacion.CalificacionDocenteGestionResumenResponse;
import com.unihub.backend.entity.CalificacionDocente;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.exception.CalificacionDocenteDuplicadaException;
import com.unihub.backend.mapper.CalificacionDocenteMapper;
import com.unihub.backend.repository.CalificacionDocenteRepository;
import com.unihub.backend.repository.DocenteMateriaRepository;
import com.unihub.backend.repository.DocenteRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.repository.EstudianteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalificacionDocenteServiceTest {

    @Mock private CalificacionDocenteRepository calificacionRepository;
    @Mock private DocenteRepository docenteRepository;
    @Mock private DocenteMateriaRepository docenteMateriaRepository;
    @Mock private MateriaRepository materiaRepository;
    @Mock private EstudianteRepository estudianteRepository;
    @Mock private ActividadEstudianteService actividadEstudianteService;

    private CalificacionDocenteService calificacionService;

    @BeforeEach
    void setUp() {
        calificacionService = new CalificacionDocenteService(calificacionRepository, docenteRepository,
            new CalificacionDocenteMapper(), docenteMateriaRepository, materiaRepository, estudianteRepository,
            actividadEstudianteService);
    }

    @Test
    @DisplayName("Crear una calificacion unica por estudiante, docente y materia")
    void deberiaCrearUnaCalificacionUnicaPorEstudianteDocenteYMateria() {
        Materia materia = mock(Materia.class);
        when(materia.getId()).thenReturn(10L);
        Docente docente = new Docente("Ana Docente");
        CalificacionDocenteRequest request = new CalificacionDocenteRequest(1L, 10L, 25L, 8, 7, 9, "año-I");
        when(docenteRepository.findById(1L)).thenReturn(Optional.of(docente));
        when(materiaRepository.findById(10L)).thenReturn(Optional.of(materia));
        when(docenteMateriaRepository.existsByDocenteIdAndMateriaId(1L, 10L)).thenReturn(true);
        when(estudianteRepository.findById(25L)).thenReturn(Optional.of(new Estudiante("Estudiante", "pass", "123", "e@example.com", "Sistemas")));
        when(calificacionRepository.findFirstByEstudiante_IdAndDocenteIdAndMateriaId(25L, 1L, 10L))
                .thenReturn(Optional.empty());
        when(calificacionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals(10L, calificacionService.crear(request).idMateria());
        verify(actividadEstudianteService).registrarCalificacionDocente(
                any(Estudiante.class), same(docente), same(materia));
        mostrarResultado("Crear una calificacion unica por estudiante, docente y materia");
    }

    @Test
    @DisplayName("Rechazar una calificacion cuando el docente no imparte la materia")
    void deberiaRechazarDocenteQueNoImparteLaMateria() {
        CalificacionDocenteRequest request = new CalificacionDocenteRequest(1L, 10L, 25L, 8, 7, 9, "año-I");
        when(docenteRepository.findById(1L)).thenReturn(Optional.of(new Docente("Ana Docente")));
        when(materiaRepository.findById(10L)).thenReturn(Optional.of(new Materia()));
        when(docenteMateriaRepository.existsByDocenteIdAndMateriaId(1L, 10L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> calificacionService.crear(request));
        mostrarResultado("Rechazar una calificacion cuando el docente no imparte la materia");
    }

    @Test
    @DisplayName("Rechazar una calificacion duplicada con la excepcion manejada como WARN")
    void deberiaLanzarExcepcionDeCalificacionDuplicada() {
        CalificacionDocenteRequest request = new CalificacionDocenteRequest(1L, 10L, 25L, 8, 7, 9, "año-I");
        when(docenteRepository.findById(1L)).thenReturn(Optional.of(new Docente("Ana Docente")));
        when(materiaRepository.findById(10L)).thenReturn(Optional.of(new Materia()));
        when(docenteMateriaRepository.existsByDocenteIdAndMateriaId(1L, 10L)).thenReturn(true);
        when(estudianteRepository.findById(25L)).thenReturn(Optional.of(
                new Estudiante("Estudiante", "pass", "123", "e@example.com", "Sistemas")));
        when(calificacionRepository.findFirstByEstudiante_IdAndDocenteIdAndMateriaId(25L, 1L, 10L))
                .thenReturn(Optional.of(mock(com.unihub.backend.entity.CalificacionDocente.class)));

        assertThrows(CalificacionDocenteDuplicadaException.class, () -> calificacionService.crear(request));
        mostrarResultado("Rechazar la calificacion duplicada con la excepcion manejada como WARN");
    }

    @Test
    @DisplayName("Agrupar aliases de gestión sin perder evaluaciones ni asignar año a periodos heredados")
    void deberiaAgruparTodasLasEvaluacionesPorGestionCanonica() {
        Docente ana = mock(Docente.class);
        when(ana.getId()).thenReturn(1L);
        when(ana.getNombre()).thenReturn("Ana Docente");
        Docente luis = mock(Docente.class);
        when(luis.getId()).thenReturn(2L);
        when(luis.getNombre()).thenReturn("Luis Docente");

        List<CalificacionDocente> calificaciones = List.of(
                calificacion("2026-1", ana, 10, 4, 8),
                calificacion("2026-I", ana, 6, 8, 6),
                calificacion("2026-I", luis, 8, 6, 8),
                calificacion("2026-2", ana, 7, 9, 7),
                calificacion("2026-II", luis, 9, 7, 9),
                calificacion("I-Año", ana, 5, 6, 7),
                calificacion("año-I", ana, 7, 8, 9),
                calificacion("II-Año", luis, 4, 5, 6),
                calificacion("año-II", luis, 8, 7, 6),
                calificacion("2027-II", luis, 8, 8, 8)
        );
        when(calificacionRepository.findByMateriaId(10L)).thenReturn(calificaciones);

        List<CalificacionDocenteGestionResumenResponse> historial =
                calificacionService.obtenerHistorialGestiones(10L);

        assertEquals(List.of("2026-I", "2026-II", "2027-II", "año-I", "año-II"),
                historial.stream().map(CalificacionDocenteGestionResumenResponse::gestion).toList());
        assertEquals(calificaciones.size(), historial.stream()
                .mapToLong(CalificacionDocenteGestionResumenResponse::cantidadEvaluaciones)
                .sum());
        CalificacionDocenteGestionResumenResponse primerSemestre = historial.get(0);
        assertEquals(List.of("2026-1", "2026-I"), primerSemestre.gestionesOriginales());
        assertEquals(3, primerSemestre.cantidadEvaluaciones());
        assertEquals(2, primerSemestre.docentes().get(0).cantidadEvaluaciones());
        assertEquals(8.0, primerSemestre.docentes().get(0).claridadExplicacionesPromedio());
        assertEquals(6.0, primerSemestre.docentes().get(0).metodologiaPromedio());

        CalificacionDocenteGestionResumenResponse legado = historial.get(3);
        assertNull(legado.anio());
        assertEquals("I", legado.semestre());
        assertEquals(List.of("I-Año", "año-I"), legado.gestionesOriginales());
        assertEquals(2, legado.cantidadEvaluaciones());
        CalificacionDocenteGestionResumenResponse segundoLegado = historial.get(4);
        assertNull(segundoLegado.anio());
        assertEquals("II", segundoLegado.semestre());
        assertEquals(List.of("II-Año", "año-II"), segundoLegado.gestionesOriginales());
        assertEquals(2, segundoLegado.cantidadEvaluaciones());
        mostrarResultado("Agrupar aliases de gestión sin perder evaluaciones ni asignar año a periodos heredados");
    }

    private CalificacionDocente calificacion(
            String gestion,
            Docente docente,
            int claridad,
            int metodologia,
            int relacion
    ) {
        CalificacionDocente calificacion = mock(CalificacionDocente.class);
        when(calificacion.getGestion()).thenReturn(gestion);
        when(calificacion.getDocente()).thenReturn(docente);
        when(calificacion.getClaridadExplicaciones()).thenReturn(claridad);
        when(calificacion.getMetodologia()).thenReturn(metodologia);
        when(calificacion.getRelacionClasesEvaluaciones()).thenReturn(relacion);
        return calificacion;
    }

    private void mostrarResultado(String mensaje) {
        System.out.println("[TEST CALIFICACION DOCENTE] " + mensaje + " - OK");
    }
}
