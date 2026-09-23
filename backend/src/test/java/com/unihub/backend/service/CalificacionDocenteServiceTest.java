package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.CalificacionDocenteMapper;
import com.unihub.backend.repository.CalificacionDocenteRepository;
import com.unihub.backend.repository.DocenteMateriaRepository;
import com.unihub.backend.repository.DocenteRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalificacionDocenteServiceTest {

    @Mock private CalificacionDocenteRepository calificacionRepository;
    @Mock private DocenteRepository docenteRepository;
    @Mock private DocenteMateriaRepository docenteMateriaRepository;
    @Mock private MateriaRepository materiaRepository;

    private CalificacionDocenteService calificacionService;

    @BeforeEach
    void setUp() {
        calificacionService = new CalificacionDocenteService(calificacionRepository, docenteRepository,
                new CalificacionDocenteMapper(), docenteMateriaRepository, materiaRepository);
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
        when(calificacionRepository.findFirstByIdEstudianteAndDocenteIdAndMateriaId(25L, 1L, 10L))
                .thenReturn(Optional.empty());
        when(calificacionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals(10L, calificacionService.crear(request).idMateria());
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

    private void mostrarResultado(String mensaje) {
        System.out.println("[TEST CALIFICACION DOCENTE] " + mensaje + " - OK");
    }
}
