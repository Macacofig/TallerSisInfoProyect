package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionMateriaRequest;
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

    private void mostrarResultado(String descripcion) {
        System.out.println("-----------------------------");
        System.out.println(descripcion);
        System.out.println("Resultado: OK");
        System.out.println("-----------------------------");
    }
}
