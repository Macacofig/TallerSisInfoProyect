package com.unihub.backend.service;

import com.unihub.backend.dto.ayudante.SolicitudAyudaRequest;
import com.unihub.backend.dto.ayudante.SolicitudAyudaResponse;
import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudAyuda;
import com.unihub.backend.mapper.SolicitudAyudaMapper;
import com.unihub.backend.repository.AyudanteMateriaRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.repository.SolicitudAyudaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SolicitudAyudaServiceTest {

    @Mock
    private SolicitudAyudaRepository solicitudAyudaRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private AyudanteMateriaRepository ayudanteMateriaRepository;

    @Mock
    private MateriaRepository materiaRepository;

    private SolicitudAyudaService service;
    private SolicitudAyudaMapper mapper = new SolicitudAyudaMapper();

    @BeforeEach
    void setUp() {
        service = new SolicitudAyudaService(solicitudAyudaRepository, estudianteRepository, ayudanteMateriaRepository, materiaRepository, mapper);
    }

    private Estudiante estudiante(Long id) {
        Estudiante e = new Estudiante("Test " + id, "pass", "77700000", "test" + id + "@test.com", "ingeniería en sistemas");
        setId(e, id);
        return e;
    }

    private Materia materia(Long id) {
        Materia m = new Materia("TEST" + id, "Test Materia " + id, "ingeniería en sistemas", 1);
        setId(m, id);
        return m;
    }

    private void setId(Object entity, Long id) {
        try {
            Field field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private AyudanteMateria ayudanteMateria(Long id, Estudiante estudiante, Materia materia) {
        AyudanteMateria am = new AyudanteMateria(estudiante, materia, "Lunes 10-12");
        am.aprobar();
        setId(am, id);
        return am;
    }

    private SolicitudAyuda solicitudAyuda(Long id, Estudiante estudiante, AyudanteMateria ayudante, Materia materia, String peticion) {
        SolicitudAyuda s = new SolicitudAyuda(estudiante, ayudante, materia, peticion);
        setId(s, id);
        return s;
    }

    @Test
    void deberiaCrearSolicitudAyuda() {
        Long estudianteId = 11L;
        Long ayudanteId = 22L;
        Long estudianteAyudanteId = 33L;
        Long materiaId = 44L;
        String peticion = "Hola Test 33, soy Test 11. Quisiera que me des ayudantía en la materia Álgebra.\n\n"
                + "  Necesito ayuda con matrices, límites y el ejercicio 5. ¿Podemos revisarlo?  ";

        Estudiante estudiante = estudiante(estudianteId);
        Estudiante ayudanteEst = estudiante(estudianteAyudanteId);
        Materia materia = materia(materiaId);
        AyudanteMateria ayudante = ayudanteMateria(ayudanteId, ayudanteEst, materia);

        when(estudianteRepository.findById(estudianteId)).thenReturn(Optional.of(estudiante));
        when(ayudanteMateriaRepository.findById(ayudanteId)).thenReturn(Optional.of(ayudante));
        when(materiaRepository.findById(materiaId)).thenReturn(Optional.of(materia));
        when(solicitudAyudaRepository.save(any(SolicitudAyuda.class))).thenAnswer(inv -> {
            SolicitudAyuda s = inv.getArgument(0);
            setId(s, 1L);
            return s;
        });

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(estudianteId, ayudanteId, materiaId, peticion);
        SolicitudAyudaResponse response = service.solicitarAyuda(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(estudianteId, response.idEstudiante());
        assertEquals(ayudanteId, response.idAyudante());
        assertEquals(materiaId, response.idMateria());
        assertEquals(peticion, response.peticion());
        assertEquals("RESUELTA", response.estado());
        ArgumentCaptor<SolicitudAyuda> captor = ArgumentCaptor.forClass(SolicitudAyuda.class);
        verify(solicitudAyudaRepository, times(1)).save(captor.capture());
        SolicitudAyuda guardada = captor.getValue();
        assertEquals(SolicitudAyuda.EstadoSolicitudAyuda.RESUELTA, guardada.getEstado());
        assertEquals(peticion, guardada.getPeticion());
        assertSame(estudiante, guardada.getEstudiante());
        assertSame(ayudante, guardada.getAyudante());
        assertSame(ayudanteEst, guardada.getAyudante().getEstudiante());
        assertSame(materia, guardada.getMateria());
        assertSame(materia, guardada.getAyudante().getMateria());
        verify(estudianteRepository).findById(estudianteId);
        verify(ayudanteMateriaRepository).findById(ayudanteId);
        verify(materiaRepository).findById(materiaId);
        verifyNoMoreInteractions(solicitudAyudaRepository);
    }

    @Test
    void deberiaLanzarExcepcionSiEstudianteNoExiste() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.empty());

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(1L, 1L, 1L, "Petición");
        assertThrows(IllegalArgumentException.class, () -> service.solicitarAyuda(request));
        verifyNoInteractions(solicitudAyudaRepository);
    }

    @Test
    void deberiaLanzarExcepcionSiAyudanteNoExiste() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante(1L)));
        when(ayudanteMateriaRepository.findById(1L)).thenReturn(Optional.empty());

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(1L, 1L, 1L, "Petición");
        assertThrows(IllegalArgumentException.class, () -> service.solicitarAyuda(request));
        verifyNoInteractions(solicitudAyudaRepository);
    }

    @Test
    void deberiaLanzarExcepcionSiMateriaNoExiste() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante(1L)));
        when(ayudanteMateriaRepository.findById(1L)).thenReturn(Optional.of(ayudanteMateria(1L, estudiante(2L), materia(1L))));
        when(materiaRepository.findById(1L)).thenReturn(Optional.empty());

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(1L, 1L, 1L, "Petición");
        assertThrows(IllegalArgumentException.class, () -> service.solicitarAyuda(request));
        verifyNoInteractions(solicitudAyudaRepository);
    }

    @Test
    void deberiaLanzarExcepcionSiAyudanteNoPerteneceAMateria() {
        Materia materia1 = materia(1L);
        Materia materia2 = materia(2L);
        Estudiante estudiante = estudiante(1L);
        Estudiante ayudanteEst = estudiante(2L);
        AyudanteMateria ayudante = ayudanteMateria(1L, ayudanteEst, materia2);

        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante));
        when(ayudanteMateriaRepository.findById(1L)).thenReturn(Optional.of(ayudante));
        when(materiaRepository.findById(1L)).thenReturn(Optional.of(materia1));

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(1L, 1L, 1L, "Petición");
        assertThrows(IllegalArgumentException.class, () -> service.solicitarAyuda(request));
        verifyNoInteractions(solicitudAyudaRepository);
    }

    @ParameterizedTest
    @EnumSource(value = AyudanteMateria.EstadoAyudante.class, names = {"PENDIENTE", "RECHAZADO", "INACTIVO"})
    void deberiaLanzarExcepcionSiAyudanteNoEstaAprobado(AyudanteMateria.EstadoAyudante estado) {
        Materia materia = materia(1L);
        Estudiante estudiante = estudiante(1L);
        Estudiante ayudanteEst = estudiante(2L);
        AyudanteMateria ayudante = new AyudanteMateria(ayudanteEst, materia, "Lunes 10-12");
        ayudante.setEstado(estado);
        setId(ayudante, 1L);

        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante));
        when(ayudanteMateriaRepository.findById(1L)).thenReturn(Optional.of(ayudante));
        when(materiaRepository.findById(1L)).thenReturn(Optional.of(materia));

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(1L, 1L, 1L, "Petición");
        assertThrows(IllegalArgumentException.class, () -> service.solicitarAyuda(request));
        verifyNoInteractions(solicitudAyudaRepository);
    }

    @Test
    void deberiaObtenerPorAyudante() {
        Long ayudanteId = 1L;
        AyudanteMateria ayudante = ayudanteMateria(ayudanteId, estudiante(2L), materia(1L));

        SolicitudAyuda s1 = solicitudAyuda(1L, estudiante(1L), ayudante, materia(1L), "Petición 1");
        SolicitudAyuda s2 = solicitudAyuda(2L, estudiante(3L), ayudante, materia(1L), "Petición 2");

        when(solicitudAyudaRepository.findByAyudanteId(ayudanteId)).thenReturn(List.of(s1, s2));

        List<SolicitudAyudaResponse> response = service.obtenerPorAyudante(ayudanteId);

        assertEquals(2, response.size());
    }

    @Test
    void deberiaObtenerPorEstudiante() {
        Long estudianteId = 1L;
        AyudanteMateria ayudante = ayudanteMateria(1L, estudiante(2L), materia(1L));

        SolicitudAyuda s1 = solicitudAyuda(1L, estudiante(estudianteId), ayudante, materia(1L), "Petición 1");
        SolicitudAyuda s2 = solicitudAyuda(2L, estudiante(estudianteId), ayudante, materia(2L), "Petición 2");

        when(solicitudAyudaRepository.findByEstudianteId(estudianteId)).thenReturn(List.of(s1, s2));

        List<SolicitudAyudaResponse> response = service.obtenerPorEstudiante(estudianteId);

        assertEquals(2, response.size());
    }

    @Test
    void deberiaObtenerPendientesPorAyudante() {
        Long ayudanteId = 1L;
        AyudanteMateria ayudante = ayudanteMateria(ayudanteId, estudiante(2L), materia(1L));

        SolicitudAyuda s1 = solicitudAyuda(1L, estudiante(1L), ayudante, materia(1L), "Petición pendiente");
        // Simula una solicitud anterior al cambio de estado inicial.
        s1.setEstado(SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE);
        SolicitudAyuda s2 = solicitudAyuda(2L, estudiante(3L), ayudante, materia(1L), "Petición resuelta");
        s2.resolver();

        when(solicitudAyudaRepository.findByAyudanteIdAndEstado(ayudanteId, SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE))
                .thenReturn(List.of(s1));

        List<SolicitudAyudaResponse> response = service.obtenerPendientesPorAyudante(ayudanteId);

        assertEquals(1, response.size());
        assertEquals("PENDIENTE", response.get(0).estado());
    }

    @Test
    void deberiaResolverSolicitud() {
        Long idSolicitud = 1L;
        SolicitudAyuda s = solicitudAyuda(idSolicitud, estudiante(1L), ayudanteMateria(1L, estudiante(2L), materia(1L)), materia(1L), "Petición");
        s.setEstado(SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE);

        when(solicitudAyudaRepository.findById(idSolicitud)).thenReturn(Optional.of(s));
        when(solicitudAyudaRepository.save(any(SolicitudAyuda.class))).thenAnswer(inv -> inv.getArgument(0));

        SolicitudAyudaResponse response = service.resolver(idSolicitud);

        assertEquals("RESUELTA", response.estado());
        verify(solicitudAyudaRepository).save(s);
    }

    @Test
    void deberiaCancelarSolicitud() {
        Long idSolicitud = 1L;
        Long idEstudiante = 1L;
        SolicitudAyuda s = solicitudAyuda(idSolicitud, estudiante(idEstudiante), ayudanteMateria(1L, estudiante(2L), materia(1L)), materia(1L), "Petición");

        when(solicitudAyudaRepository.findById(idSolicitud)).thenReturn(Optional.of(s));
        when(solicitudAyudaRepository.save(any(SolicitudAyuda.class))).thenAnswer(inv -> inv.getArgument(0));

        SolicitudAyudaResponse response = service.cancelar(idSolicitud, idEstudiante);

        assertEquals("CANCELADA", response.estado());
        verify(solicitudAyudaRepository).save(s);
    }

    @Test
    void deberiaLanzarExcepcionSiNoEsDueñoAlCancelar() {
        Long idSolicitud = 1L;
        Long idEstudiante = 1L;
        SolicitudAyuda s = solicitudAyuda(idSolicitud, estudiante(2L), ayudanteMateria(1L, estudiante(3L), materia(1L)), materia(1L), "Petición");

        when(solicitudAyudaRepository.findById(idSolicitud)).thenReturn(Optional.of(s));

        assertThrows(IllegalArgumentException.class, () -> service.cancelar(idSolicitud, idEstudiante));
        verify(solicitudAyudaRepository, never()).save(any(SolicitudAyuda.class));
    }
}
