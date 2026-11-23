package com.unihub.backend.service;

import com.unihub.backend.dto.material.SolicitudMaterialResponse;
import com.unihub.backend.dto.material.MaterialEstudianteResponse;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Material;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudMaterial;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.MaterialMapper;
import com.unihub.backend.repository.ActividadEstudianteRepository;
import com.unihub.backend.repository.MaterialRepository;
import com.unihub.backend.repository.SolicitudMaterialRepository;
import com.unihub.backend.service.almacenamiento.AlmacenamientoArchivos;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SolicitudMaterialServiceTest {

    private static final long SOLICITUD_ID = 1L;
    private static final long ESTUDIANTE_ID = 7L;
    private static final long MATERIA_ID = 3L;
    private static final long DOCENTE_ID = 9L;
    private static final long MATERIAL_ID = 15L;

    @Mock
    private SolicitudMaterialRepository solicitudMaterialRepository;

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private ActividadEstudianteRepository actividadRepository;

    @Mock
    private AlmacenamientoArchivos almacenamiento;

    private SolicitudMaterialService servicio;

    private Estudiante estudiante;
    private Materia materia;
    private Docente docente;
    private Material material;
    private SolicitudMaterial solicitud;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        servicio = new SolicitudMaterialService(
                solicitudMaterialRepository,
                materialRepository,
                new MaterialMapper(),
                actividadRepository,
                almacenamiento
        );

        estudiante = new Estudiante("Ana Pérez", "hash", "70000000", "ana@example.com", "Sistemas");
        org.springframework.test.util.ReflectionTestUtils.setField(estudiante, "id", ESTUDIANTE_ID);

        materia = new Materia("SIS-101", "Programación I", "Sistemas", 1);
        org.springframework.test.util.ReflectionTestUtils.setField(materia, "id", MATERIA_ID);

        docente = new Docente("Carlos Gómez");
        org.springframework.test.util.ReflectionTestUtils.setField(docente, "id", DOCENTE_ID);

        material = new Material(
                "https://proyecto.supabase.co/storage/v1/object/public/MaterialsTaller/materias-3/apunte.pdf",
                "Apunte de clase",
                "Resumen del tema 1",
                Material.TipoMaterial.PDF,
                materia,
                docente,
                2
        );
        org.springframework.test.util.ReflectionTestUtils.setField(material, "id", MATERIAL_ID);

        solicitud = new SolicitudMaterial("Apunte de clase", estudiante, material);
        org.springframework.test.util.ReflectionTestUtils.setField(solicitud, "id", SOLICITUD_ID);
    }

    @Test
    void obtenerTodasDevuelveTodasLasSolicitudesDeMaterial() {
        when(solicitudMaterialRepository.findAll()).thenReturn(List.of(solicitud));

        List<SolicitudMaterialResponse> respuesta = servicio.obtenerTodas();

        assertEquals(1, respuesta.size());
        assertEquals(SOLICITUD_ID, respuesta.getFirst().id());
        assertEquals("Apunte de clase", respuesta.getFirst().titulo());
        assertEquals("PENDIENTE", respuesta.getFirst().estado());
    }

    @Test
    void obtenerPorEstudianteFiltraPorIdYDevuelveLosEstadosYDatosDisponibles() {
        SolicitudMaterial aprobada = new SolicitudMaterial("Material aprobado", estudiante, material);
        org.springframework.test.util.ReflectionTestUtils.setField(aprobada, "id", 2L);
        aprobada.aprobar();
        material.activar();

        SolicitudMaterial negada = new SolicitudMaterial("Material negado", estudiante, null);
        org.springframework.test.util.ReflectionTestUtils.setField(negada, "id", 3L);
        negada.negar();

        when(solicitudMaterialRepository.findByEstudianteId(ESTUDIANTE_ID))
                .thenReturn(List.of(solicitud, aprobada, negada));
        when(solicitudMaterialRepository.findByEstudianteId(99L)).thenReturn(List.of());

        List<MaterialEstudianteResponse> materialesPropios = servicio.obtenerPorEstudiante(ESTUDIANTE_ID);
        List<MaterialEstudianteResponse> materialesDeOtroEstudiante = servicio.obtenerPorEstudiante(99L);

        assertEquals(List.of("PENDIENTE", "APROBADO", "NEGADO"),
                materialesPropios.stream().map(MaterialEstudianteResponse::estado).toList());
        assertEquals("Programación I", materialesPropios.getFirst().nombreMateria());
        assertEquals("PDF", materialesPropios.getFirst().tipo());
        assertEquals("Material negado", materialesPropios.getLast().titulo());
        assertNull(materialesPropios.getLast().nombreMateria());
        assertNull(materialesPropios.getLast().tipo());
        assertTrue(materialesDeOtroEstudiante.isEmpty());
        verify(solicitudMaterialRepository).findByEstudianteId(ESTUDIANTE_ID);
        verify(solicitudMaterialRepository).findByEstudianteId(99L);
    }

    @Test
    void obtenerPendientesDevuelveSoloLasSolicitudesPendientes() {
        when(solicitudMaterialRepository.findByEstadoOrderByTituloAsc(
                SolicitudMaterial.EstadoSolicitudMaterial.PENDIENTE
        )).thenReturn(List.of(solicitud));

        List<SolicitudMaterialResponse> respuesta = servicio.obtenerPendientes();

        assertEquals(1, respuesta.size());
        assertEquals("PENDIENTE", respuesta.getFirst().estado());
    }

    @Test
    void aprobarCambiaEstadoDeSolicitudYMaterial() {
        when(solicitudMaterialRepository.findById(SOLICITUD_ID)).thenReturn(Optional.of(solicitud));
        when(materialRepository.findById(MATERIAL_ID)).thenReturn(Optional.of(material));

        SolicitudMaterialResponse respuesta = servicio.aprobar(SOLICITUD_ID);

        assertEquals("APROBADO", respuesta.estado());
        assertEquals(SolicitudMaterial.EstadoSolicitudMaterial.APROBADO, solicitud.getEstado());
        assertEquals(Material.EstadoMaterial.ACTIVO, material.getEstado());
        verify(solicitudMaterialRepository).save(solicitud);
        verify(materialRepository).save(material);
    }

    @Test
    void rechazarCambiaEstadoDeSolicitudYEliminaMaterialYArchivo() {
        when(solicitudMaterialRepository.findById(SOLICITUD_ID)).thenReturn(Optional.of(solicitud));

        SolicitudMaterialResponse respuesta = servicio.rechazar(SOLICITUD_ID);

        assertEquals("NEGADO", respuesta.estado());
        assertEquals(SolicitudMaterial.EstadoSolicitudMaterial.NEGADO, solicitud.getEstado());
        verify(almacenamiento).eliminar("materias-3/apunte.pdf");
        verify(solicitudMaterialRepository).save(solicitud);
        verify(materialRepository).delete(material);
    }

    @Test
    void aprobarLanzaErrorCuandoLaSolicitudNoExiste() {
        when(solicitudMaterialRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException error = assertThrows(ResourceNotFoundException.class,
                () -> servicio.aprobar(99L));

        assertTrue(error.getMessage().contains("solicitud"));
        verify(solicitudMaterialRepository, never()).save(any());
    }

    @Test
    void rechazarLanzaErrorCuandoLaSolicitudNoExiste() {
        when(solicitudMaterialRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException error = assertThrows(ResourceNotFoundException.class,
                () -> servicio.rechazar(99L));

        assertTrue(error.getMessage().contains("solicitud"));
        verify(solicitudMaterialRepository, never()).save(any());
    }

    @Test
    void aprobarRechazaCuandoLaSolicitudYaFueDecidida() {
        solicitud.aprobar();
        material.activar();
        when(solicitudMaterialRepository.findById(SOLICITUD_ID)).thenReturn(Optional.of(solicitud));

        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> servicio.aprobar(SOLICITUD_ID));

        assertTrue(error.getMessage().contains("pendiente"));
        verify(solicitudMaterialRepository, never()).save(any());
    }

    @Test
    void obtenerTodasVaciaCuandoNoHaySolicitudes() {
        when(solicitudMaterialRepository.findAll()).thenReturn(List.of());

        List<SolicitudMaterialResponse> respuesta = servicio.obtenerTodas();

        assertTrue(respuesta.isEmpty());
    }

    @Test
    void obtenerPendientesVaciaCuandoNoHayPendientes() {
        when(solicitudMaterialRepository.findByEstadoOrderByTituloAsc(
                SolicitudMaterial.EstadoSolicitudMaterial.PENDIENTE
        )).thenReturn(List.of());

        List<SolicitudMaterialResponse> respuesta = servicio.obtenerPendientes();

        assertTrue(respuesta.isEmpty());
        assertFalse(respuesta.contains(null));
    }

    @Test
    void obtenerPorEstudianteVaciaCuandoNoTieneSolicitudes() {
        when(solicitudMaterialRepository.findByEstudianteId(ESTUDIANTE_ID)).thenReturn(List.of());

        assertTrue(servicio.obtenerPorEstudiante(ESTUDIANTE_ID).isEmpty());
    }
}
