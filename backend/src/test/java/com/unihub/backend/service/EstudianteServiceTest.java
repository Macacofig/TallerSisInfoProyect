package com.unihub.backend.service;

import com.unihub.backend.dto.estudiante.EstudianteRequest;
import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.mapper.EstudianteMapper;
import com.unihub.backend.repository.EstudianteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EstudianteServiceTest {

    @Mock
    private EstudianteRepository estudianteRepository;

    private EstudianteService estudianteService;

    @BeforeEach
    void setUp() {
        estudianteService = new EstudianteService(estudianteRepository, new EstudianteMapper());
    }

    @Test
    void deberiaRegistrarEstudianteNormalizandoEspacios() {
        EstudianteRequest request = new EstudianteRequest(
                "  Ana   Pérez  ",
                "  ClaveSegura1!  ",
                " 71234567 ",
                " ana@ucb.edu.bo ",
                "  Ingeniería   de   Sistemas  "
        );
        when(estudianteRepository.existsByCorreoElectronicoIgnoreCase("ana@ucb.edu.bo")).thenReturn(false);
        when(estudianteRepository.save(any(Estudiante.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        EstudianteResponse resultado = estudianteService.registrar(request);

        assertEquals("Ana Pérez", resultado.nombre());
        assertEquals("71234567", resultado.telefono());
        assertEquals("ana@ucb.edu.bo", resultado.correoElectronico());
        assertEquals("Ingeniería de Sistemas", resultado.carrera());

        ArgumentCaptor<Estudiante> captor = ArgumentCaptor.forClass(Estudiante.class);
        verify(estudianteRepository).save(captor.capture());
        assertEquals("ClaveSegura1!", captor.getValue().getContrasena());
    }

    @Test
    void deberiaRechazarCorreoElectronicoDuplicado() {
        EstudianteRequest request = new EstudianteRequest(
                "Ana Pérez", "ClaveSegura1!", "71234567", "ana@ucb.edu.bo", "Ingeniería"
        );
        when(estudianteRepository.existsByCorreoElectronicoIgnoreCase("ana@ucb.edu.bo")).thenReturn(true);

        IllegalArgumentException excepcion = assertThrows(
                IllegalArgumentException.class,
                () -> estudianteService.registrar(request)
        );

        assertEquals("El correo electrónico ya está registrado", excepcion.getMessage());
        verify(estudianteRepository, never()).save(any(Estudiante.class));
    }
}
