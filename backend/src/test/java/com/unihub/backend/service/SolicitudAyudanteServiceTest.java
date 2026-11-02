package com.unihub.backend.service;

import com.unihub.backend.dto.ayudante.SolicitudAyudanteRequest;
import com.unihub.backend.dto.ayudante.SolicitudAyudanteResponse;
import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudAyudante;
import com.unihub.backend.mapper.SolicitudAyudanteMapper;
import com.unihub.backend.repository.AyudanteMateriaRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.repository.SolicitudAyudanteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SolicitudAyudanteServiceTest {

    @Mock
    private SolicitudAyudanteRepository solicitudAyudanteRepository;

    @Mock
    private AyudanteMateriaRepository ayudanteMateriaRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private MateriaRepository materiaRepository;

    private SolicitudAyudanteService service;
    private SolicitudAyudanteMapper mapper = new SolicitudAyudanteMapper();

    @BeforeEach
    void setUp() {
        service = new SolicitudAyudanteService(
                solicitudAyudanteRepository, ayudanteMateriaRepository, estudianteRepository, materiaRepository, mapper);
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

    private SolicitudAyudante solicitudAyudante(Long id, Estudiante estudiante, Materia materia, String motivo, Double calificacion, String horarios) {
        SolicitudAyudante s = new SolicitudAyudante(estudiante, materia, motivo, calificacion, horarios);
        setId(s, id);
        return s;
    }

    @Test
    void deberiaCrearSolicitudAyudante() {
        Long estudianteId = 1L;
        Long materiaId = 1L;

        when(estudianteRepository.findById(estudianteId)).thenReturn(Optional.of(estudiante(estudianteId)));
        when(materiaRepository.findById(materiaId)).thenReturn(Optional.of(materia(materiaId)));
        when(solicitudAyudanteRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(anyLong(), anyLong(), anyList()))
                .thenReturn(false);
        when(ayudanteMateriaRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(anyLong(), anyLong(), anyList()))
                .thenReturn(false);
        when(ayudanteMateriaRepository.save(any(AyudanteMateria.class))).thenAnswer(inv -> inv.getArgument(0));
        when(solicitudAyudanteRepository.save(any(SolicitudAyudante.class))).thenAnswer(inv -> {
            SolicitudAyudante s = inv.getArgument(0);
            setId(s, 1L);
            return s;
        });

        SolicitudAyudanteRequest request = new SolicitudAyudanteRequest(estudianteId, materiaId, "Me gusta enseñar", 9.5, "Lunes 10-12, Miércoles 10-12");
        SolicitudAyudanteResponse response = service.solicitar(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(estudianteId, response.idEstudiante());
        assertEquals(materiaId, response.idMateria());
        assertEquals("Me gusta enseñar", response.motivo());
        assertEquals(9.5, response.calificacion());
        assertEquals("Lunes 10-12, Miércoles 10-12", response.horarios());
        assertEquals("PENDIENTE", response.estado());
        verify(solicitudAyudanteRepository).save(any(SolicitudAyudante.class));
        org.mockito.ArgumentCaptor<AyudanteMateria> ayudanteCaptor =
                org.mockito.ArgumentCaptor.forClass(AyudanteMateria.class);
        verify(ayudanteMateriaRepository).save(ayudanteCaptor.capture());
        AyudanteMateria ayudanteMateria = ayudanteCaptor.getValue();
        assertEquals(estudianteId, ayudanteMateria.getEstudiante().getId());
        assertEquals(materiaId, ayudanteMateria.getMateria().getId());
        assertEquals("Lunes 10-12, Miércoles 10-12", ayudanteMateria.getHorario());
        assertEquals(AyudanteMateria.EstadoAyudante.PENDIENTE, ayudanteMateria.getEstado());
        org.mockito.ArgumentCaptor<SolicitudAyudante> solicitudCaptor =
                org.mockito.ArgumentCaptor.forClass(SolicitudAyudante.class);
        verify(solicitudAyudanteRepository).save(solicitudCaptor.capture());
        assertSame(ayudanteMateria, solicitudCaptor.getValue().getAyudanteMateria());
    }

    @Test
    void deberiaLanzarExcepcionSiEstudianteNoExiste() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.empty());

        SolicitudAyudanteRequest request = new SolicitudAyudanteRequest(1L, 1L, "Motivo", 9.0, "Lunes 10-12");
        assertThrows(IllegalArgumentException.class, () -> service.solicitar(request));
    }

    @Test
    void deberiaLanzarExcepcionSiMateriaNoExiste() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante(1L)));
        when(materiaRepository.findById(1L)).thenReturn(Optional.empty());

        SolicitudAyudanteRequest request = new SolicitudAyudanteRequest(1L, 1L, "Motivo", 9.0, "Lunes 10-12");
        assertThrows(IllegalArgumentException.class, () -> service.solicitar(request));
    }

    @Test
    void deberiaLanzarExcepcionSiYaExisteSolicitudActiva() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante(1L)));
        when(materiaRepository.findById(1L)).thenReturn(Optional.of(materia(1L)));
        when(solicitudAyudanteRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(anyLong(), anyLong(), anyList()))
                .thenReturn(true);

        SolicitudAyudanteRequest request = new SolicitudAyudanteRequest(1L, 1L, "Motivo", 9.0, "Lunes 10-12");
        assertThrows(IllegalArgumentException.class, () -> service.solicitar(request));
    }

    @Test
    void deberiaObtenerPorEstudiante() {
        Long estudianteId = 1L;
        Estudiante estudiante = estudiante(estudianteId);
        Materia materia = materia(1L);

        SolicitudAyudante s1 = solicitudAyudante(1L, estudiante, materia, "Motivo 1", 9.0, "Lunes 10-12");
        SolicitudAyudante s2 = solicitudAyudante(2L, estudiante, materia(2L), "Motivo 2", 8.5, "Martes 10-12");

        when(solicitudAyudanteRepository.findByEstudianteId(estudianteId)).thenReturn(List.of(s1, s2));

        List<SolicitudAyudanteResponse> response = service.obtenerPorEstudiante(estudianteId);

        assertEquals(2, response.size());
    }

    @Test
    void deberiaObtenerPorMateria() {
        Long materiaId = 1L;
        Materia materia = materia(materiaId);
        Estudiante estudiante = estudiante(1L);

        SolicitudAyudante s1 = solicitudAyudante(1L, estudiante, materia, "Motivo 1", 9.0, "Lunes 10-12");
        SolicitudAyudante s2 = solicitudAyudante(2L, estudiante(2L), materia, "Motivo 2", 8.5, "Martes 10-12");

        when(solicitudAyudanteRepository.findByMateriaId(materiaId)).thenReturn(List.of(s1, s2));

        List<SolicitudAyudanteResponse> response = service.obtenerPorMateria(materiaId);

        assertEquals(2, response.size());
    }

    @Test
    void deberiaObtenerPendientes() {
        SolicitudAyudante s1 = solicitudAyudante(1L, estudiante(1L), materia(1L), "Motivo 1", 9.0, "Lunes 10-12");
        SolicitudAyudante s2 = solicitudAyudante(2L, estudiante(2L), materia(2L), "Motivo 2", 8.5, "Martes 10-12");
        s1.setEstado(SolicitudAyudante.EstadoSolicitud.PENDIENTE);
        s2.setEstado(SolicitudAyudante.EstadoSolicitud.PENDIENTE);

        when(solicitudAyudanteRepository.findByEstado(SolicitudAyudante.EstadoSolicitud.PENDIENTE))
                .thenReturn(List.of(s1, s2));

        List<SolicitudAyudanteResponse> response = service.obtenerPendientes();

        assertEquals(2, response.size());
        assertEquals("PENDIENTE", response.get(0).estado());
    }

    @Test
    void deberiaAprobarSolicitud() {
        Long idSolicitud = 1L;
        SolicitudAyudante s = solicitudAyudante(idSolicitud, estudiante(1L), materia(1L), "Motivo", 9.0, "Lunes 10-12");

        when(solicitudAyudanteRepository.findByIdForUpdate(idSolicitud)).thenReturn(Optional.of(s));
        when(solicitudAyudanteRepository.save(any(SolicitudAyudante.class))).thenAnswer(inv -> inv.getArgument(0));
        AyudanteMateria relacion = AyudanteMateria.pendientePorSolicitud(
                s.getEstudiante(), s.getMateria(), s.getHorarios());
        s.asociarAyudanteMateria(relacion);
        when(ayudanteMateriaRepository.save(any(AyudanteMateria.class))).thenAnswer(inv -> inv.getArgument(0));

        SolicitudAyudanteResponse response = service.aprobar(idSolicitud);

        assertEquals("APROBADA", response.estado());
        assertEquals(AyudanteMateria.EstadoAyudante.APROBADO, relacion.getEstado());
        verify(solicitudAyudanteRepository).findByIdForUpdate(idSolicitud);
        verify(solicitudAyudanteRepository).save(s);
        verify(ayudanteMateriaRepository).save(relacion);
    }

    @Test
    void deberiaRechazarSolicitud() {
        Long idSolicitud = 1L;
        SolicitudAyudante s = solicitudAyudante(idSolicitud, estudiante(1L), materia(1L), "Motivo", 9.0, "Lunes 10-12");

        when(solicitudAyudanteRepository.findByIdForUpdate(idSolicitud)).thenReturn(Optional.of(s));
        when(solicitudAyudanteRepository.save(any(SolicitudAyudante.class))).thenAnswer(inv -> inv.getArgument(0));
        AyudanteMateria relacion = AyudanteMateria.pendientePorSolicitud(
                s.getEstudiante(), s.getMateria(), s.getHorarios());
        s.asociarAyudanteMateria(relacion);
        when(ayudanteMateriaRepository.save(any(AyudanteMateria.class))).thenAnswer(inv -> inv.getArgument(0));

        SolicitudAyudanteResponse response = service.rechazar(idSolicitud);

        assertEquals("RECHAZADA", response.estado());
        assertEquals(AyudanteMateria.EstadoAyudante.RECHAZADO, relacion.getEstado());
        verify(solicitudAyudanteRepository).findByIdForUpdate(idSolicitud);
        verify(solicitudAyudanteRepository).save(s);
        verify(ayudanteMateriaRepository).save(relacion);
    }

    @Test
    void decisionesSoloModificanAsignacionAsociadaYNoBuscanPorEstudianteMateriaEstado() {
        SolicitudAyudante s = solicitudAyudante(11L, estudiante(1L), materia(1L), "Motivo", 9.0, "Lunes");
        AyudanteMateria asociada = AyudanteMateria.pendientePorSolicitud(s.getEstudiante(), s.getMateria(), "Lunes");
        AyudanteMateria independiente = AyudanteMateria.pendientePorSolicitud(s.getEstudiante(), s.getMateria(), "Martes");
        s.asociarAyudanteMateria(asociada);
        when(solicitudAyudanteRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(s));
        when(solicitudAyudanteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(ayudanteMateriaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.aprobar(11L);

        assertEquals(AyudanteMateria.EstadoAyudante.APROBADO, asociada.getEstado());
        assertEquals(AyudanteMateria.EstadoAyudante.PENDIENTE, independiente.getEstado());
        verify(ayudanteMateriaRepository).save(asociada);
        verify(ayudanteMateriaRepository, never()).findByEstudianteIdAndMateriaIdAndEstado(anyLong(), anyLong(), any());
    }

    @Test
    void solicitudHistoricaSinAsociacionFallaAntesDeCambiarEstado() {
        SolicitudAyudante s = solicitudAyudante(12L, estudiante(1L), materia(1L), "Motivo", 9.0, "Lunes");
        when(solicitudAyudanteRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(s));

        IllegalStateException error = assertThrows(IllegalStateException.class, () -> service.aprobar(12L));

        assertTrue(error.getMessage().contains("reconciliación"));
        assertEquals(SolicitudAyudante.EstadoSolicitud.PENDIENTE, s.getEstado());
        verify(solicitudAyudanteRepository, never()).save(any());
        verify(ayudanteMateriaRepository, never()).save(any());
        verify(ayudanteMateriaRepository, never()).findByEstudianteIdAndMateriaIdAndEstado(anyLong(), anyLong(), any());
    }

    @Test
    void estadoCruzadoFallaAntesDeCambiarLaSolicitud() {
        SolicitudAyudante s = solicitudAyudante(13L, estudiante(1L), materia(1L), "Motivo", 9.0, "Lunes");
        AyudanteMateria relacion = AyudanteMateria.pendientePorSolicitud(s.getEstudiante(), s.getMateria(), "Lunes");
        relacion.rechazar();
        s.asociarAyudanteMateria(relacion);
        when(solicitudAyudanteRepository.findByIdForUpdate(13L)).thenReturn(Optional.of(s));

        assertThrows(IllegalStateException.class, () -> service.aprobar(13L));

        assertEquals(SolicitudAyudante.EstadoSolicitud.PENDIENTE, s.getEstado());
        assertEquals(AyudanteMateria.EstadoAyudante.RECHAZADO, relacion.getEstado());
        verify(solicitudAyudanteRepository, never()).save(any());
        verify(ayudanteMateriaRepository, never()).save(any());
    }

    @Test
    void decisionesDuplicadasFallaSinModificarLaAsignacion() {
        SolicitudAyudante s = solicitudAyudante(14L, estudiante(1L), materia(1L), "Motivo", 9.0, "Lunes");
        s.aprobar();
        AyudanteMateria relacion = AyudanteMateria.pendientePorSolicitud(s.getEstudiante(), s.getMateria(), "Lunes");
        relacion.aprobar();
        s.asociarAyudanteMateria(relacion);
        when(solicitudAyudanteRepository.findByIdForUpdate(14L)).thenReturn(Optional.of(s));

        assertThrows(IllegalStateException.class, () -> service.aprobar(14L));
        assertThrows(IllegalStateException.class, () -> service.rechazar(14L));

        assertEquals(SolicitudAyudante.EstadoSolicitud.APROBADA, s.getEstado());
        assertEquals(AyudanteMateria.EstadoAyudante.APROBADO, relacion.getEstado());
        verify(solicitudAyudanteRepository, never()).save(any());
        verify(ayudanteMateriaRepository, never()).save(any());
    }

    @Test
    void solicitudIniciaPendienteYAsignacionDeSolicitudUsaEstadoPendiente() {
        SolicitudAyudante solicitud = new SolicitudAyudante(
                estudiante(3L), materia(3L), "Motivo", 8.0, "Viernes 10-12");
        AyudanteMateria relacion = AyudanteMateria.pendientePorSolicitud(
                estudiante(3L), materia(3L), "Viernes 10-12");

        assertEquals(SolicitudAyudante.EstadoSolicitud.PENDIENTE, solicitud.getEstado());
        assertEquals(AyudanteMateria.EstadoAyudante.PENDIENTE, relacion.getEstado());

        solicitud.aprobar();
        relacion.aprobar();
        assertThrows(IllegalStateException.class, solicitud::aprobar);
        assertThrows(IllegalStateException.class, solicitud::rechazar);

        SolicitudAyudante solicitudRechazada = new SolicitudAyudante(
                estudiante(4L), materia(4L), "Motivo", 8.0, "Viernes 10-12");
        AyudanteMateria relacionRechazada = AyudanteMateria.pendientePorSolicitud(
                estudiante(4L), materia(4L), "Viernes 10-12");
        solicitudRechazada.rechazar();
        relacionRechazada.rechazar();
        assertThrows(IllegalStateException.class, solicitudRechazada::aprobar);
        assertThrows(IllegalStateException.class, solicitudRechazada::rechazar);
        assertEquals(AyudanteMateria.EstadoAyudante.RECHAZADO, relacionRechazada.getEstado());
    }

    @Test
    void asignacionIndependienteIniciaAprobada() {
        assertEquals(AyudanteMateria.EstadoAyudante.APROBADO,
                new AyudanteMateria(estudiante(5L), materia(5L), "Lunes").getEstado());
    }
}
