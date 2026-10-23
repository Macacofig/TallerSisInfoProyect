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
        Long estudianteId = 1L;
        Long ayudanteId = 2L;
        Long materiaId = 1L;

        Estudiante estudiante = estudiante(estudianteId);
        Estudiante ayudanteEst = estudiante(ayudanteId);
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

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(estudianteId, ayudanteId, materiaId, "Necesito ayuda con el TP");
        SolicitudAyudaResponse response = service.solicitarAyuda(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(estudianteId, response.idEstudiante());
        assertEquals(ayudanteId, response.idAyudante());
        assertEquals(materiaId, response.idMateria());
        assertEquals("Necesito ayuda con el TP", response.peticion());
        assertEquals("PENDIENTE", response.estado());
        verify(solicitudAyudaRepository).save(any(SolicitudAyuda.class));
    }

    @Test
    void deberiaLanzarExcepcionSiEstudianteNoExiste() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.empty());

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(1L, 1L, 1L, "Petición");
        assertThrows(IllegalArgumentException.class, () -> service.solicitarAyuda(request));
    }

    @Test
    void deberiaLanzarExcepcionSiAyudanteNoExiste() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante(1L)));
        when(ayudanteMateriaRepository.findById(1L)).thenReturn(Optional.empty());

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(1L, 1L, 1L, "Petición");
        assertThrows(IllegalArgumentException.class, () -> service.solicitarAyuda(request));
    }

    @Test
    void deberiaLanzarExcepcionSiMateriaNoExiste() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante(1L)));
        when(ayudanteMateriaRepository.findById(1L)).thenReturn(Optional.of(ayudanteMateria(1L, estudiante(2L), materia(1L))));
        when(materiaRepository.findById(1L)).thenReturn(Optional.empty());

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(1L, 1L, 1L, "Petición");
        assertThrows(IllegalArgumentException.class, () -> service.solicitarAyuda(request));
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
    }

    @Test
    void deberiaLanzarExcepcionSiAyudanteNoEstaAprobado() {
        Materia materia = materia(1L);
        Estudiante estudiante = estudiante(1L);
        Estudiante ayudanteEst = estudiante(2L);
        AyudanteMateria ayudante = new AyudanteMateria(ayudanteEst, materia, "Lunes 10-12");
        setId(ayudante, 1L);

        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante));
        when(ayudanteMateriaRepository.findById(1L)).thenReturn(Optional.of(ayudante));
        when(materiaRepository.findById(1L)).thenReturn(Optional.of(materia));

        SolicitudAyudaRequest request = new SolicitudAyudaRequest(1L, 1L, 1L, "Petición");
        assertThrows(IllegalArgumentException.class, () -> service.solicitarAyuda(request));
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
    }
}