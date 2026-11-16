package com.unihub.backend.service;

import com.unihub.backend.dto.material.MaterialRequest;
import com.unihub.backend.dto.material.MaterialResponse;
import com.unihub.backend.dto.material.MaterialSubidoResponse;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Material;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudMaterial;
import com.unihub.backend.exception.BadRequestException;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.MaterialMapper;
import com.unihub.backend.repository.DocenteMateriaRepository;
import com.unihub.backend.repository.DocenteRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MaterialRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.repository.SolicitudMaterialRepository;
import com.unihub.backend.service.almacenamiento.AlmacenamientoArchivos;
import com.unihub.backend.service.almacenamiento.ArchivoAlmacenado;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MaterialServiceTest {

    private static final long ESTUDIANTE_ID = 7L;
    private static final long MATERIA_ID = 3L;
    private static final long DOCENTE_ID = 9L;
    private static final long TAMANIO_MAXIMO = 20L * 1024 * 1024;

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private SolicitudMaterialRepository solicitudMaterialRepository;

    @Mock
    private MateriaRepository materiaRepository;

    @Mock
    private DocenteRepository docenteRepository;

    @Mock
    private DocenteMateriaRepository docenteMateriaRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private AlmacenamientoArchivos almacenamiento;

    private MaterialService materialService;

    private Estudiante estudiante;
    private Materia materia;
    private Docente docente;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        materialService = new MaterialService(
                materialRepository,
                solicitudMaterialRepository,
                materiaRepository,
                docenteRepository,
                docenteMateriaRepository,
                estudianteRepository,
                almacenamiento,
                new MaterialMapper(),
                TAMANIO_MAXIMO
        );

        estudiante = new Estudiante("Ana Pérez", "hash", "70000000", "ana@example.com", "Sistemas");
        ReflectionTestUtils.setField(estudiante, "id", ESTUDIANTE_ID);

        materia = new Materia("SIS-101", "Programación I", "Sistemas", 1);
        ReflectionTestUtils.setField(materia, "id", MATERIA_ID);

        docente = new Docente("Carlos Gómez");
        ReflectionTestUtils.setField(docente, "id", DOCENTE_ID);
    }

    @Test
    void subeElArchivoYRegistraMaterialYSolicitudPendientes() {
        MockMultipartFile documento = new MockMultipartFile(
                "documento", "apunte.pdf", "application/pdf", "contenido".getBytes());

        when(estudianteRepository.findById(ESTUDIANTE_ID)).thenReturn(Optional.of(estudiante));
        when(materiaRepository.findById(MATERIA_ID)).thenReturn(Optional.of(materia));
        when(docenteRepository.findById(DOCENTE_ID)).thenReturn(Optional.of(docente));
        when(docenteMateriaRepository.existsByDocenteIdAndMateriaId(DOCENTE_ID, MATERIA_ID))
                .thenReturn(true);
        when(almacenamiento.subir(any(), eq("apunte.pdf"), eq("application/pdf"), eq("materias-3")))
                .thenReturn(new ArchivoAlmacenado(
                        "https://proyecto.supabase.co/storage/v1/object/public/materiales/materias-3/apunte.pdf",
                        "materias-3/apunte.pdf"));
        when(materialRepository.save(any(Material.class))).thenAnswer(invocacion -> {
            Material material = invocacion.getArgument(0);
            ReflectionTestUtils.setField(material, "id", 15L);
            return material;
        });
        when(solicitudMaterialRepository.save(any(SolicitudMaterial.class))).thenAnswer(invocacion -> {
            SolicitudMaterial solicitud = invocacion.getArgument(0);
            ReflectionTestUtils.setField(solicitud, "id", 22L);
            return solicitud;
        });

        MaterialSubidoResponse respuesta = materialService.subirMaterialAcademico(
                new MaterialRequest("Apunte de clase", "Resumen del tema 1", MATERIA_ID, DOCENTE_ID, 2),
                documento,
                ESTUDIANTE_ID
        );

        assertEquals(15L, respuesta.material().id());
        assertEquals("Apunte de clase", respuesta.material().titulo());
        assertEquals("PDF", respuesta.material().tipo());
        assertEquals("PENDIENTE", respuesta.material().estado());
        assertEquals(2, respuesta.material().semestreIngresado());
        assertEquals("https://proyecto.supabase.co/storage/v1/object/public/materiales/materias-3/apunte.pdf",
                respuesta.material().linkMaterial());

        assertEquals(22L, respuesta.solicitud().id());
        assertEquals("PENDIENTE", respuesta.solicitud().estado());
        assertEquals(ESTUDIANTE_ID, respuesta.solicitud().idEstudiante());
        assertEquals(15L, respuesta.solicitud().idMaterial());

        verify(almacenamiento).subir(any(), eq("apunte.pdf"), eq("application/pdf"), eq("materias-3"));
        verify(materialRepository).save(any(Material.class));
        verify(solicitudMaterialRepository).save(any(SolicitudMaterial.class));
        verify(almacenamiento, never()).eliminar(anyString());
    }

    @Test
    void rechazaFormatosNoPermitidosSinSubirElArchivo() {
        MockMultipartFile documento = new MockMultipartFile(
                "documento", "programa.exe", "application/octet-stream", "binario".getBytes());

        BadRequestException error = assertThrows(BadRequestException.class, () ->
                materialService.subirMaterialAcademico(
                        new MaterialRequest("Programa", "Ejecutable", MATERIA_ID, DOCENTE_ID, null),
                        documento,
                        ESTUDIANTE_ID));

        assertTrue(error.getMessage().contains("Formato no permitido"));
        verify(almacenamiento, never()).subir(any(), anyString(), anyString(), anyString());
        verify(materialRepository, never()).save(any(Material.class));
    }

    @Test
    void eliminaElArchivoSubidoCuandoFallaElGuardadoEnBaseDeDatos() {
        MockMultipartFile documento = new MockMultipartFile(
                "documento", "presentacion.pptx", "application/octet-stream", "slides".getBytes());

        when(estudianteRepository.findById(ESTUDIANTE_ID)).thenReturn(Optional.of(estudiante));
        when(materiaRepository.findById(MATERIA_ID)).thenReturn(Optional.of(materia));
        when(docenteRepository.findById(DOCENTE_ID)).thenReturn(Optional.of(docente));
        when(docenteMateriaRepository.existsByDocenteIdAndMateriaId(DOCENTE_ID, MATERIA_ID))
                .thenReturn(true);
        when(almacenamiento.subir(any(), eq("presentacion.pptx"), anyString(), eq("materias-3")))
                .thenReturn(new ArchivoAlmacenado("https://url", "materias-3/presentacion.pptx"));
        when(materialRepository.save(any(Material.class)))
                .thenThrow(new RuntimeException("fallo de base de datos"));

        assertThrows(RuntimeException.class, () ->
                materialService.subirMaterialAcademico(
                        new MaterialRequest("Slides", "Presentación", MATERIA_ID, DOCENTE_ID, null),
                        documento,
                        ESTUDIANTE_ID));

        verify(almacenamiento).eliminar("materias-3/presentacion.pptx");
        verify(solicitudMaterialRepository, never()).save(any(SolicitudMaterial.class));
    }

    @Test
    void rechazaDocenteQueNoImparteLaMateria() {
        MockMultipartFile documento = new MockMultipartFile(
                "documento", "foto.png", "image/png", "imagen".getBytes());

        when(estudianteRepository.findById(ESTUDIANTE_ID)).thenReturn(Optional.of(estudiante));
        when(materiaRepository.findById(MATERIA_ID)).thenReturn(Optional.of(materia));
        when(docenteRepository.findById(DOCENTE_ID)).thenReturn(Optional.of(docente));
        when(docenteMateriaRepository.existsByDocenteIdAndMateriaId(DOCENTE_ID, MATERIA_ID))
                .thenReturn(false);

        BadRequestException error = assertThrows(BadRequestException.class, () ->
                materialService.subirMaterialAcademico(
                        new MaterialRequest("Foto", "Imagen del pizarrón", MATERIA_ID, DOCENTE_ID, null),
                        documento,
                        ESTUDIANTE_ID));

        assertTrue(error.getMessage().contains("no imparte"));
        verify(almacenamiento, never()).subir(any(), anyString(), anyString(), anyString());
    }

    @Test
    void rechazaCuandoElEstudianteNoExiste() {
        MockMultipartFile documento = new MockMultipartFile(
                "documento", "foto.jpg", "image/jpeg", "imagen".getBytes());

        when(estudianteRepository.findById(ESTUDIANTE_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                materialService.subirMaterialAcademico(
                        new MaterialRequest("Foto", "Imagen", MATERIA_ID, DOCENTE_ID, null),
                        documento,
                        ESTUDIANTE_ID));

        verify(almacenamiento, never()).subir(any(), anyString(), anyString(), anyString());
    }

    @Test
    void rechazaArchivosQueSuperanElTamanioMaximo() {
        MaterialService servicioConLimitePequeno = new MaterialService(
                materialRepository,
                solicitudMaterialRepository,
                materiaRepository,
                docenteRepository,
                docenteMateriaRepository,
                estudianteRepository,
                almacenamiento,
                new MaterialMapper(),
                10
        );

        MockMultipartFile documento = new MockMultipartFile(
                "documento", "grande.pdf", "application/pdf", "contenido mayor a diez bytes".getBytes());

        BadRequestException error = assertThrows(BadRequestException.class, () ->
                servicioConLimitePequeno.subirMaterialAcademico(
                        new MaterialRequest("Grande", "Archivo grande", MATERIA_ID, DOCENTE_ID, null),
                        documento,
                        ESTUDIANTE_ID));

        assertTrue(error.getMessage().contains("tamaño máximo"));
        verify(almacenamiento, never()).subir(any(), anyString(), anyString(), anyString());
    }

    @Test
    void obtenerPorMateriaDevuelveLosMaterialesConNombresYLink() {
        Material material = new Material(
                "https://proyecto.supabase.co/storage/v1/object/public/MaterialsTaller/materias-3/apunte.pdf",
                "Apunte de clase",
                "Resumen del tema 1",
                Material.TipoMaterial.PDF,
                materia,
                docente,
                2
        );
        ReflectionTestUtils.setField(material, "id", 15L);

        when(materiaRepository.existsById(MATERIA_ID)).thenReturn(true);
        when(materialRepository.findByMateriaIdOrderByTituloAsc(MATERIA_ID))
                .thenReturn(List.of(material));

        List<MaterialResponse> respuesta = materialService.obtenerPorMateria(MATERIA_ID, null, null, null);

        assertEquals(1, respuesta.size());
        MaterialResponse primero = respuesta.getFirst();
        assertEquals(15L, primero.id());
        assertEquals("Apunte de clase", primero.titulo());
        assertEquals("Resumen del tema 1", primero.descripcion());
        assertEquals("PDF", primero.tipo());
        assertEquals(MATERIA_ID, primero.idMateria());
        assertEquals("Programación I", primero.nombreMateria());
        assertEquals(DOCENTE_ID, primero.idDocente());
        assertEquals("Carlos Gómez", primero.nombreDocente());
        assertEquals(2, primero.semestreIngresado());
        assertEquals("PENDIENTE", primero.estado());
        assertEquals("https://proyecto.supabase.co/storage/v1/object/public/MaterialsTaller/materias-3/apunte.pdf",
                primero.linkMaterial());

        verify(materialRepository).findByMateriaIdOrderByTituloAsc(MATERIA_ID);
    }

    @Test
    void obtenerPorMateriaFallaCuandoLaMateriaNoExiste() {
        when(materiaRepository.existsById(MATERIA_ID)).thenReturn(false);

        ResourceNotFoundException error = assertThrows(ResourceNotFoundException.class,
                () -> materialService.obtenerPorMateria(MATERIA_ID, null, null, null));

        assertTrue(error.getMessage().contains("materia"));
        verify(materialRepository, never()).findByMateriaIdOrderByTituloAsc(anyLong());
    }

    @Test
    void obtenerPorMateriaRechazaIdentificadoresInvalidos() {
        assertThrows(BadRequestException.class,
                () -> materialService.obtenerPorMateria(null, null, null, null));
        assertThrows(BadRequestException.class,
                () -> materialService.obtenerPorMateria(0L, null, null, null));

        verify(materialRepository, never()).findByMateriaIdOrderByTituloAsc(anyLong());
    }

    @Test
    void obtenerPorMateriaFiltraPorDocenteSemestreYTipo() {
        Docente otroDocente = new Docente("Lucía Rojas");
        ReflectionTestUtils.setField(otroDocente, "id", 10L);

        Material apuntePdf = material("Apunte de clase", Material.TipoMaterial.PDF, docente, 2, 15L);
        Material guiaWord = material("Guía de laboratorio", Material.TipoMaterial.WORD, docente, 3, 16L);
        Material otroPdf = material("Diapositivas", Material.TipoMaterial.PDF, otroDocente, 2, 17L);

        when(materiaRepository.existsById(MATERIA_ID)).thenReturn(true);
        when(materialRepository.findByMateriaIdOrderByTituloAsc(MATERIA_ID))
                .thenReturn(List.of(apuntePdf, guiaWord, otroPdf));

        List<MaterialResponse> respuesta = materialService.obtenerPorMateria(
                MATERIA_ID, DOCENTE_ID, 2, "pdf");

        assertEquals(1, respuesta.size());
        assertEquals(15L, respuesta.getFirst().id());
        assertEquals("Apunte de clase", respuesta.getFirst().titulo());
    }

    @Test
    void obtenerPorMateriaSinFiltrosDevuelveTodosLosMateriales() {
        Docente otroDocente = new Docente("Lucía Rojas");
        ReflectionTestUtils.setField(otroDocente, "id", 10L);

        when(materiaRepository.existsById(MATERIA_ID)).thenReturn(true);
        when(materialRepository.findByMateriaIdOrderByTituloAsc(MATERIA_ID)).thenReturn(List.of(
                material("Apunte de clase", Material.TipoMaterial.PDF, docente, 2, 15L),
                material("Guía de laboratorio", Material.TipoMaterial.WORD, docente, 3, 16L),
                material("Diapositivas", Material.TipoMaterial.PDF, otroDocente, 2, 17L)));

        List<MaterialResponse> respuesta = materialService.obtenerPorMateria(
                MATERIA_ID, null, null, "  ");

        assertEquals(3, respuesta.size());
    }

    @Test
    void obtenerPorMateriaRechazaFiltrosInvalidos() {
        assertThrows(BadRequestException.class,
                () -> materialService.obtenerPorMateria(MATERIA_ID, 0L, null, null));
        assertThrows(BadRequestException.class,
                () -> materialService.obtenerPorMateria(MATERIA_ID, null, 0, null));
        assertThrows(BadRequestException.class,
                () -> materialService.obtenerPorMateria(MATERIA_ID, null, 21, null));
        assertThrows(BadRequestException.class,
                () -> materialService.obtenerPorMateria(MATERIA_ID, null, null, "exe"));

        verify(materialRepository, never()).findByMateriaIdOrderByTituloAsc(anyLong());
    }

    private Material material(
            String titulo,
            Material.TipoMaterial tipo,
            Docente docenteDelMaterial,
            Integer semestre,
            Long id
    ) {
        Material material = new Material(
                "https://proyecto.supabase.co/storage/v1/object/public/MaterialsTaller/materias-3/archivo",
                titulo,
                "Descripción de " + titulo,
                tipo,
                materia,
                docenteDelMaterial,
                semestre
        );
        ReflectionTestUtils.setField(material, "id", id);
        return material;
    }
}
