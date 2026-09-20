package com.unihub.backend.service;

import com.unihub.backend.dto.docente.DocenteRequest;
import com.unihub.backend.dto.docente.DocenteResponse;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.DocenteMapper;
import com.unihub.backend.repository.DocenteRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocenteServiceTest {

    @Mock
    private DocenteRepository docenteRepository;

    @Mock
    private MateriaRepository materiaRepository;

    private DocenteService docenteService;

    private final DocenteMapper docenteMapper = new DocenteMapper();

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        docenteService = new DocenteService(docenteRepository, materiaRepository, docenteMapper);
    }

    @Test
    void deberiaAgregarDocenteAUnaMateria() {
        Materia materia = mock(Materia.class);
        when(materia.getId()).thenReturn(1L);
        when(materiaRepository.findById(1L)).thenReturn(Optional.of(materia));
        when(docenteRepository.save(any(Docente.class))).thenReturn(new Docente("Ana Pérez", materia));

        DocenteResponse resultado = docenteService.agregar(new DocenteRequest("  Ana Pérez  ", 1L));

        assertEquals("Ana Pérez", resultado.nombre());
        assertEquals(materia.getId(), resultado.idMateria());
        var docenteCaptor = forClass(Docente.class);
        verify(materiaRepository).findById(1L);
        verify(docenteRepository).save(docenteCaptor.capture());
        assertEquals("Ana Pérez", docenteCaptor.getValue().getNombre());
        mostrarResultado("Agregar docente a una materia");
    }

    @Test
    void deberiaRechazarDocenteCuandoLaMateriaNoExiste() {
        when(materiaRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException excepcion = assertThrows(IllegalArgumentException.class,
            () -> docenteService.agregar(new DocenteRequest("Ana Pérez", 99L)));

        assertEquals("La materia no existe", excepcion.getMessage());
        mostrarResultado("Rechazar docente cuando la materia no existe");
    }

    @Test
    void deberiaMostrarDocentesDeUnaMateria() {
        Materia materia = mock(Materia.class);
        when(materia.getId()).thenReturn(1L);
        when(docenteRepository.findByMateriaIdOrderByNombreAsc(1L)).thenReturn(List.of(
                new Docente("Ana Pérez", materia),
                new Docente("Luis Gómez", materia)
        ));

        List<DocenteResponse> resultado = docenteService.obtenerPorMateria(1L);

        assertEquals(List.of("Ana Pérez", "Luis Gómez"),
                resultado.stream().map(DocenteResponse::nombre).toList());
        assertEquals(List.of(1L, 1L),
                resultado.stream().map(DocenteResponse::idMateria).toList());
        verify(docenteRepository).findByMateriaIdOrderByNombreAsc(1L);
        mostrarResultado("Mostrar docentes de una materia");
    }

    private void mostrarResultado(String descripcion) {
        System.out.println("-----------------------------");
        System.out.println(descripcion);
        System.out.println("Resultado: OK");
        System.out.println("-----------------------------");
    }
}