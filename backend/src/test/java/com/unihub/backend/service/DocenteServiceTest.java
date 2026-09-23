package com.unihub.backend.service;

import com.unihub.backend.dto.docente.DocenteRequest;
import com.unihub.backend.dto.docente.DocenteResponse;
import com.unihub.backend.entity.Docente;
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
    private DocenteService docenteService;

    private final DocenteMapper docenteMapper = new DocenteMapper();

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        docenteService = new DocenteService(docenteRepository, docenteMapper);
    }

    @Test
    void deberiaAgregarDocenteSinMateria() {
        when(docenteRepository.save(any(Docente.class))).thenReturn(new Docente("Ana Pérez"));

        DocenteResponse resultado = docenteService.agregar(new DocenteRequest("  Ana Pérez  "));

        assertEquals("Ana Pérez", resultado.nombre());
        var docenteCaptor = forClass(Docente.class);
        verify(docenteRepository).save(docenteCaptor.capture());
        assertEquals("Ana Pérez", docenteCaptor.getValue().getNombre());
        mostrarResultado("Agregar docente a una materia");
    }

    @Test
    void deberiaMostrarDocentesDeUnaMateria() {
        when(docenteRepository.findByMateriaIdOrderByNombreAsc(1L)).thenReturn(List.of(
            new Docente("Ana Pérez"),
            new Docente("Luis Gómez")
        ));

        List<DocenteResponse> resultado = docenteService.obtenerPorMateria(1L);

        assertEquals(List.of("Ana Pérez", "Luis Gómez"),
                resultado.stream().map(DocenteResponse::nombre).toList());
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