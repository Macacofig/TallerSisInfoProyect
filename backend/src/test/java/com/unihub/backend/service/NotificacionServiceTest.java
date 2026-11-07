package com.unihub.backend.service;

import com.unihub.backend.entity.*;
import com.unihub.backend.exception.*;
import com.unihub.backend.mapper.NotificacionMapper;
import com.unihub.backend.repository.NotificacionRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import java.util.*;
import static com.unihub.backend.entity.Notificacion.TipoNotificacion.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {
    @Mock NotificacionRepository repository;
    NotificacionService service;
    Estudiante estudiante = new Estudiante("Ana", "pass", "70000000", "ana@test.com", "Sistemas");

    @BeforeEach void setup() { service = new NotificacionService(repository, new NotificacionMapper()); }

    @Test void creaNoLeidaConFechaYReferencia() {
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var dto = service.crear(estudiante, POSTULACION_CREADA, "Registrada", "Mensaje", "SOLICITUD_AYUDANTE", 5L);
        assertFalse(dto.leida());
        assertNotNull(dto.fechaCreacion());
        assertEquals(POSTULACION_CREADA, dto.tipo());
        assertEquals(5L, dto.referenciaId());
    }

    @Test void listaPaginadaSiemprePorPropietario() {
        var n = new Notificacion(estudiante, POSTULACION_CREADA, "Título", "Mensaje", null, null);
        when(repository.findByEstudianteIdOrderByFechaCreacionDescIdDesc(8L, PageRequest.of(1, 20)))
                .thenReturn(new PageImpl<>(List.of(n), PageRequest.of(1, 20), 45));
        var result = service.listar(8L, 1, 20);
        assertEquals(1, result.page());
        assertEquals(20, result.size());
        assertEquals(45, result.totalElements());
        assertTrue(result.hasMore());
        assertEquals(1, result.content().size());
    }

    @Test void validaLimitesDePaginacion() {
        for (int size : new int[]{0, -1, 101}) assertThrows(BadRequestException.class, () -> service.listar(1L, 0, size));
        assertThrows(BadRequestException.class, () -> service.listar(1L, -1, 20));
        verifyNoInteractions(repository);
    }

    @Test void cuentaSoloNoLeidasDelUsuario() {
        when(repository.countByEstudianteIdAndLeidaFalse(8L)).thenReturn(3L);
        assertEquals(3, service.contarNoLeidas(8L).count());
    }

    @Test void lecturaPropiaEsIdempotente() {
        var n = new Notificacion(estudiante, POSTULACION_CREADA, "Título", "Mensaje", null, null);
        when(repository.findByIdAndEstudianteId(7L, 8L)).thenReturn(Optional.of(n));
        service.marcarComoLeida(8L, 7L);
        service.marcarComoLeida(8L, 7L);
        assertTrue(n.isLeida());
        verify(repository, times(2)).findByIdAndEstudianteId(7L, 8L);
    }

    @Test void ajenaEInexistenteNoSeDistinguen() {
        when(repository.findByIdAndEstudianteId(anyLong(), eq(8L))).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.marcarComoLeida(8L, 7L));
        assertThrows(ResourceNotFoundException.class, () -> service.marcarComoLeida(8L, 999L));
        verify(repository, never()).findById(anyLong());
    }

    @Test void lecturaGlobalFiltraPorUsuario() {
        service.marcarTodasComoLeidas(8L);
        verify(repository).marcarTodasComoLeidas(8L);
        verifyNoMoreInteractions(repository);
    }
}
