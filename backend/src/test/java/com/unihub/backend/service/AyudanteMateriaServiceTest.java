package com.unihub.backend.service;

import com.unihub.backend.dto.ayudante.AyudanteMateriaRequest;
import com.unihub.backend.dto.ayudante.AyudanteMateriaResponse;
import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.AyudanteMateriaMapper;
import com.unihub.backend.repository.AyudanteMateriaRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
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
class AyudanteMateriaServiceTest {

    @Mock
    private AyudanteMateriaRepository ayudanteMateriaRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private MateriaRepository materiaRepository;

    private AyudanteMateriaService service;
    private AyudanteMateriaMapper mapper = new AyudanteMateriaMapper();

    @BeforeEach
    void setUp() {
        service = new AyudanteMateriaService(ayudanteMateriaRepository, estudianteRepository, materiaRepository, mapper);
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

    private AyudanteMateria ayudanteMateria(Long id, Estudiante estudiante, Materia materia, String horario) {
        AyudanteMateria am = new AyudanteMateria(estudiante, materia, horario);
        setId(am, id);
        return am;
    }

    @Test
    void deberiaCrearSolicitudAyudante() {
        Long estudianteId = 1L;
        Long materiaId = 1L;

        when(estudianteRepository.findById(estudianteId)).thenReturn(Optional.of(estudiante(estudianteId)));
        when(materiaRepository.findById(materiaId)).thenReturn(Optional.of(materia(materiaId)));
        when(ayudanteMateriaRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(anyLong(), anyLong(), anyList()))
                .thenReturn(false);
        when(ayudanteMateriaRepository.save(any(AyudanteMateria.class))).thenAnswer(inv -> {
            AyudanteMateria am = inv.getArgument(0);
            setId(am, 1L);
            return am;
        });

        AyudanteMateriaRequest request = new AyudanteMateriaRequest(estudianteId, materiaId, "Lunes 10-12");
        AyudanteMateriaResponse response = service.crear(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(estudianteId, response.idEstudiante());
        assertEquals(materiaId, response.idMateria());
        assertEquals("Lunes 10-12", response.horario());
        assertEquals("PENDIENTE", response.estado());
        verify(ayudanteMateriaRepository).save(any(AyudanteMateria.class));
    }

    @Test
    void deberiaLanzarExcepcionSiEstudianteNoExiste() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.empty());

        AyudanteMateriaRequest request = new AyudanteMateriaRequest(1L, 1L, "Lunes 10-12");
        assertThrows(IllegalArgumentException.class, () -> service.crear(request));
    }

    @Test
    void deberiaLanzarExcepcionSiMateriaNoExiste() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante(1L)));
        when(materiaRepository.findById(1L)).thenReturn(Optional.empty());

        AyudanteMateriaRequest request = new AyudanteMateriaRequest(1L, 1L, "Lunes 10-12");
        assertThrows(IllegalArgumentException.class, () -> service.crear(request));
    }

    @Test
    void deberiaLanzarExcepcionSiYaExisteSolicitudActiva() {
        when(estudianteRepository.findById(1L)).thenReturn(Optional.of(estudiante(1L)));
        when(materiaRepository.findById(1L)).thenReturn(Optional.of(materia(1L)));
        when(ayudanteMateriaRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(anyLong(), anyLong(), anyList()))
                .thenReturn(true);

        AyudanteMateriaRequest request = new AyudanteMateriaRequest(1L, 1L, "Lunes 10-12");
        assertThrows(IllegalArgumentException.class, () -> service.crear(request));
    }

    @Test
    void deberiaObtenerAyudantesAprobadosPorMateria() {
        Long materiaId = 1L;
        Materia materia = materia(materiaId);

        when(materiaRepository.findById(materiaId)).thenReturn(Optional.of(materia));

        AyudanteMateria am1 = ayudanteMateria(1L, estudiante(1L), materia, "Lunes 10-12");
        am1.aprobar();
        AyudanteMateria am2 = ayudanteMateria(2L, estudiante(2L), materia, "Martes 10-12");
        am2.aprobar();

        when(ayudanteMateriaRepository.findByMateriaIdAndEstado(materiaId, AyudanteMateria.EstadoAyudante.APROBADO))
                .thenReturn(List.of(am1, am2));

        List<AyudanteMateriaResponse> response = service.obtenerAyudantesAprobadosPorMateria(materiaId);

        assertEquals(2, response.size());
        assertEquals("APROBADO", response.get(0).estado());
        assertEquals("APROBADO", response.get(1).estado());
    }

    @Test
    void deberiaDejarDeSerAyudante() {
        Long idAyudanteMateria = 1L;
        Long idEstudiante = 1L;

        AyudanteMateria am = ayudanteMateria(idAyudanteMateria, estudiante(idEstudiante), materia(1L), "Lunes 10-12");
        am.aprobar();

        when(ayudanteMateriaRepository.findById(idAyudanteMateria)).thenReturn(Optional.of(am));

        service.dejarDeSerAyudante(idAyudanteMateria, idEstudiante);

        assertEquals(AyudanteMateria.EstadoAyudante.INACTIVO, am.getEstado());
        verify(ayudanteMateriaRepository).save(am);
    }

    @Test
    void deberiaLanzarExcepcionSiNoEsDueñoAlDejarDeSerAyudante() {
        Long idAyudanteMateria = 1L;
        Long idEstudiante = 1L;

        AyudanteMateria am = ayudanteMateria(idAyudanteMateria, estudiante(2L), materia(1L), "Lunes 10-12");
        am.aprobar();

        when(ayudanteMateriaRepository.findById(idAyudanteMateria)).thenReturn(Optional.of(am));

        assertThrows(IllegalArgumentException.class, () -> service.dejarDeSerAyudante(idAyudanteMateria, idEstudiante));
    }

    @Test
    void deberiaLanzarExcepcionSiEstadoNoEsAprobadoAlDejarDeSerAyudante() {
        Long idAyudanteMateria = 1L;
        Long idEstudiante = 1L;

        AyudanteMateria am = ayudanteMateria(idAyudanteMateria, estudiante(idEstudiante), materia(1L), "Lunes 10-12");

        when(ayudanteMateriaRepository.findById(idAyudanteMateria)).thenReturn(Optional.of(am));

        assertThrows(IllegalStateException.class, () -> service.dejarDeSerAyudante(idAyudanteMateria, idEstudiante));
    }

    @Test
    void deberiaAprobarSolicitud() {
        Long idAyudanteMateria = 1L;
        AyudanteMateria am = ayudanteMateria(idAyudanteMateria, estudiante(1L), materia(1L), "Lunes 10-12");

        when(ayudanteMateriaRepository.findById(idAyudanteMateria)).thenReturn(Optional.of(am));
        when(ayudanteMateriaRepository.save(any(AyudanteMateria.class))).thenAnswer(inv -> inv.getArgument(0));

        AyudanteMateriaResponse response = service.aprobarSolicitud(idAyudanteMateria);

        assertEquals("APROBADO", response.estado());
        verify(ayudanteMateriaRepository).save(am);
    }

    @Test
    void deberiaRechazarSolicitud() {
        Long idAyudanteMateria = 1L;
        AyudanteMateria am = ayudanteMateria(idAyudanteMateria, estudiante(1L), materia(1L), "Lunes 10-12");

        when(ayudanteMateriaRepository.findById(idAyudanteMateria)).thenReturn(Optional.of(am));
        when(ayudanteMateriaRepository.save(any(AyudanteMateria.class))).thenAnswer(inv -> inv.getArgument(0));

        AyudanteMateriaResponse response = service.rechazarSolicitud(idAyudanteMateria);

        assertEquals("RECHAZADO", response.estado());
        verify(ayudanteMateriaRepository).save(am);
    }

    @Test
    void deberiaObtenerSolicitudesPendientes() {
        AyudanteMateria am1 = ayudanteMateria(1L, estudiante(1L), materia(1L), "Lunes 10-12");
        AyudanteMateria am2 = ayudanteMateria(2L, estudiante(2L), materia(2L), "Martes 10-12");

        when(ayudanteMateriaRepository.findByEstado(AyudanteMateria.EstadoAyudante.PENDIENTE))
                .thenReturn(List.of(am1, am2));

        List<AyudanteMateriaResponse> response = service.obtenerSolicitudesPendientes();

        assertEquals(2, response.size());
        assertEquals("PENDIENTE", response.get(0).estado());
    }
}