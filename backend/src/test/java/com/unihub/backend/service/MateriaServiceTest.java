package com.unihub.backend.service;

import com.unihub.backend.dto.materia.MateriaResponse;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.MateriaMapper;
import com.unihub.backend.repository.MateriaRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MateriaServiceTest {

    @Mock
    private MateriaRepository materiaRepository;

    private MateriaMapper materiaMapper;

    private MateriaService materiaService;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        materiaMapper = new MateriaMapper();

        materiaService = new MateriaService(
                materiaRepository,
                materiaMapper
        );
    }

    @Test
    void deberiaRetornarTodasLasMaterias() {

        // Arrange

        Materia materia1 = new Materia(
                "INF101",
                "Programación I",
                "Ingeniería de Sistemas",
                1
        );

        Materia materia2 = new Materia(
                "INF202",
                "Base de Datos",
                "Ingeniería de Sistemas",
                3
        );

        when(materiaRepository.findAll())
                .thenReturn(List.of(materia1, materia2));


        // Act

        List<MateriaResponse> resultado =
                materiaService.obtenerMaterias();


        // Assert

        assertEquals(2, resultado.size());

        assertEquals(
                "Programación I",
                resultado.get(0).nombre()
        );

        assertEquals(
                "Base de Datos",
                resultado.get(1).nombre()
        );

        verify(materiaRepository, times(1))
                .findAll();
    }


    @Test
    void deberiaRetornarListaVaciaCuandoNoExistenMaterias() {

        // Arrange

        when(materiaRepository.findAll())
                .thenReturn(List.of());


        // Act

        List<MateriaResponse> resultado =
                materiaService.obtenerMaterias();


        // Assert

        assertTrue(resultado.isEmpty());

        verify(materiaRepository, times(1))
                .findAll();
    }
}