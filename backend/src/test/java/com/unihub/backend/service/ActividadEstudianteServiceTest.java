package com.unihub.backend.service;

import com.unihub.backend.dto.actividad.ActividadEstudianteActualizacionRequest;
import com.unihub.backend.dto.actividad.ActividadEstudianteRequest;
import com.unihub.backend.dto.actividad.ActividadEstudianteResponse;
import com.unihub.backend.entity.ActividadEstudiante;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.exception.AccesoNoAutorizadoException;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.ActividadEstudianteMapper;
import com.unihub.backend.repository.ActividadEstudianteRepository;
import com.unihub.backend.repository.EstudianteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActividadEstudianteServiceTest {

    @Mock
    private ActividadEstudianteRepository actividadRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    private ActividadEstudianteService actividadService;

    @BeforeEach
    void setUp() {
        actividadService = new ActividadEstudianteService(
                actividadRepository,
                estudianteRepository,
                new ActividadEstudianteMapper(),
                new JwtService(java.util.UUID.randomUUID().toString(), 3600)
        );
    }

    @Test
    void deberiaRegistrarActividadAlCalificarMateria() {
        Estudiante estudiante = estudiante(1L);

        actividadService.registrarCalificacionMateria(estudiante, materia(44L, "Álgebra lineal"));

        ActividadEstudiante actividad = capturarActividadGuardada();
        assertEquals("Calificaste la materia Álgebra lineal", actividad.getTitulo());
        assertEquals("Calificación registrada para la materia Álgebra lineal.", actividad.getDescripcion());
        assertEquals(ActividadEstudiante.EstadoActividad.REALIZADO, actividad.getEstado());
        assertNotNull(actividad.getFechaHoraRegistro());
        assertEquals(estudiante, actividad.getEstudiante());
    }

    @Test
    void deberiaRegistrarActividadAlCalificarDocente() {
        Estudiante estudiante = estudiante(11L);
        // El docente puede tener otra materia como primera relación: usar la materia evaluada.
        Docente docente = new Docente("Ana Docente", materia(77L, "Materia distinta"));
        ReflectionTestUtils.setField(docente, "id", 33L);
        actividadService.registrarCalificacionDocente(estudiante, docente, materia(44L, "Álgebra lineal"));

        ActividadEstudiante actividad = capturarActividadGuardada();
        assertSame(estudiante, actividad.getEstudiante());
        assertEquals("Calificaste a Ana Docente en Álgebra lineal", actividad.getTitulo());
        assertEquals("Calificación registrada para el docente Ana Docente en la materia Álgebra lineal.",
                actividad.getDescripcion());
        assertFalse(actividad.getDescripcion().contains("Materia distinta"));
        assertEquals(ActividadEstudiante.EstadoActividad.REALIZADO, actividad.getEstado());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void cadaCalificacionConservaSusEntidadesSinConsultasAdicionales(boolean esDocente) {
        Estudiante primero = estudiante(11L);
        Estudiante segundo = estudiante(55L);
        Materia primeraMateria = materia(22L, "Álgebra lineal");
        Materia segundaMateria = materia(77L, "Física aplicada");
        if (esDocente) {
            actividadService.registrarCalificacionDocente(primero, docente(33L, "Ana Docente"), primeraMateria);
            actividadService.registrarCalificacionDocente(segundo, docente(88L, "Luis Profesor"), segundaMateria);
        } else {
            actividadService.registrarCalificacionMateria(primero, primeraMateria);
            actividadService.registrarCalificacionMateria(segundo, segundaMateria);
        }

        var captor = ArgumentCaptor.forClass(ActividadEstudiante.class);
        verify(actividadRepository, times(2)).save(captor.capture());
        var registros = captor.getAllValues();
        assertSame(primero, registros.get(0).getEstudiante());
        assertSame(segundo, registros.get(1).getEstudiante());
        assertTrue(registros.get(0).getDescripcion().contains("Álgebra lineal"));
        assertTrue(registros.get(1).getDescripcion().contains("Física aplicada"));
        assertFalse(registros.get(1).getDescripcion().contains("Álgebra lineal"));
        if (esDocente) {
            assertTrue(registros.get(0).getDescripcion().contains("Ana Docente"));
            assertTrue(registros.get(1).getDescripcion().contains("Luis Profesor"));
            assertFalse(registros.get(1).getDescripcion().contains("Ana Docente"));
        }
        for (var registro : registros) {
            assertEquals(ActividadEstudiante.EstadoActividad.REALIZADO, registro.getEstado());
            assertFalse(registro.getDescripcion().contains(registro.getEstudiante().getTelefono()));
            assertFalse(registro.getDescripcion().contains(registro.getEstudiante().getCorreoElectronico()));
        }
        verifyNoMoreInteractions(actividadRepository, estudianteRepository);
    }

    @ParameterizedTest
    @ValueSource(strings = {"Á", "📘"})
    void calificacionesConNombresLargosConservanContextoYLimiteUnicode(String caracter) throws Exception {
        String nombreMateria = "Materia " + caracter.repeat(255 - "Materia ".length());
        String nombreDocente = "Docente " + caracter.repeat(255 - "Docente ".length());
        Estudiante estudiante = estudiante(11L);
        Materia materia = materia(22L, nombreMateria);

        actividadService.registrarCalificacionMateria(estudiante, materia);
        actividadService.registrarCalificacionDocente(estudiante, docente(33L, nombreDocente), materia);

        var captor = ArgumentCaptor.forClass(ActividadEstudiante.class);
        verify(actividadRepository, times(2)).save(captor.capture());
        var registros = captor.getAllValues();
        int limite = ActividadEstudiante.class.getDeclaredField("titulo")
                .getAnnotation(jakarta.persistence.Column.class).length();
        for (var registro : registros) {
            assertEquals(limite, registro.getTitulo().codePointCount(0, registro.getTitulo().length()));
            assertTrue(registro.getTitulo().endsWith("…"));
            assertTrue(java.nio.charset.StandardCharsets.UTF_8.newEncoder().canEncode(registro.getTitulo()));
            assertTrue(registro.getDescripcion().contains(nombreMateria));
            assertEquals(ActividadEstudiante.EstadoActividad.REALIZADO, registro.getEstado());
        }
        assertTrue(registros.get(1).getDescripcion().contains(nombreDocente));
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void tituloDeCalificacionQueCabeExactamenteNoSeRecorta(boolean esDocente) {
        Estudiante estudiante = estudiante(11L);
        String titulo;
        if (esDocente) {
            String nombre = "Á".repeat(255 - "Calificaste a  en Álgebra".length());
            titulo = "Calificaste a " + nombre + " en Álgebra";
            actividadService.registrarCalificacionDocente(estudiante, docente(33L, nombre), materia(22L, "Álgebra"));
        } else {
            String nombre = "Á".repeat(255 - "Calificaste la materia ".length());
            titulo = "Calificaste la materia " + nombre;
            actividadService.registrarCalificacionMateria(estudiante, materia(22L, nombre));
        }

        assertEquals(titulo, capturarActividadGuardada().getTitulo());
    }

    @Test
    void calificacionesSinEstudianteConservanLaReglaDeNoRegistrarActividad() {
        Materia materia = materia(22L, "Álgebra");

        actividadService.registrarCalificacionMateria(null, materia);
        actividadService.registrarCalificacionDocente(null, docente(33L, "Ana Docente"), materia);

        verifyNoInteractions(actividadRepository, estudianteRepository);
    }

    @Test
    void deberiaRegistrarSolicitudDeAyudaConContextoRealSinDatosPrivados() {
        Estudiante solicitante = estudiante(11L);
        Estudiante ayudante = estudiante(33L);
        Materia materia = materia(44L, "Álgebra lineal");
        LocalDateTime antes = LocalDateTime.now(ZoneId.of("America/La_Paz"));

        actividadService.registrarSolicitudAyuda(solicitante, materia, ayudante);

        LocalDateTime despues = LocalDateTime.now(ZoneId.of("America/La_Paz"));
        ActividadEstudiante actividad = capturarActividadGuardada();
        assertSame(solicitante, actividad.getEstudiante());
        assertEquals("Solicitaste ayuda en Álgebra lineal", actividad.getTitulo());
        assertEquals("Solicitud de ayuda enviada al ayudante Estudiante 33.", actividad.getDescripcion());
        assertEquals(ActividadEstudiante.EstadoActividad.REALIZADO, actividad.getEstado());
        assertTrue(!actividad.getFechaHoraRegistro().isBefore(antes)
                && !actividad.getFechaHoraRegistro().isAfter(despues));
        String contenido = actividad.getTitulo() + actividad.getDescripcion();
        assertFalse(contenido.contains(solicitante.getTelefono()));
        assertFalse(contenido.contains(ayudante.getTelefono()));
        assertFalse(contenido.contains(solicitante.getCorreoElectronico()));
        assertFalse(contenido.contains(ayudante.getCorreoElectronico()));
    }

    @Test
    void deberiaRegistrarActividadPendienteAlSolicitarSerAyudante() {
        Materia materia = materia(5L, "Programación I");

        actividadService.registrarSolicitudAyudante(estudiante(3L), materia);

        ActividadEstudiante actividad = capturarActividadGuardada();
        assertEquals("Solicitar ser ayudante en Programación I", actividad.getTitulo());
        assertEquals("Solicitud enviada a ser probada", actividad.getDescripcion());
        assertEquals(ActividadEstudiante.EstadoActividad.PENDIENTE, actividad.getEstado());
    }

    @ParameterizedTest
    @ValueSource(strings = {"Á", "📘"})
    void deberiaConservarMateriaLargaSinExcederLimiteDelTitulo(String caracter) throws Exception {
        String nombreMateria = caracter.repeat(255);

        actividadService.registrarSolicitudAyuda(estudiante(11L), materia(44L, nombreMateria), estudiante(33L));

        ActividadEstudiante actividad = capturarActividadGuardada();
        int limite = ActividadEstudiante.class.getDeclaredField("titulo")
                .getAnnotation(jakarta.persistence.Column.class).length();
        assertTrue(actividad.getTitulo().codePointCount(0, actividad.getTitulo().length()) <= limite,
                "Una materia válida no debe provocar un título que exceda la columna de actividad");
        assertTrue(actividad.getTitulo().startsWith("Solicitaste ayuda en "));
        assertTrue(actividad.getTitulo().endsWith("…"));
        assertTrue(actividad.getDescripcion().contains(nombreMateria));
        assertTrue(actividad.getDescripcion().contains("Estudiante 33"));
        assertFalse(actividad.getTitulo().contains("\uFFFD"));
        assertTrue(java.nio.charset.StandardCharsets.UTF_8.newEncoder().canEncode(actividad.getTitulo()));
        assertEquals(ActividadEstudiante.EstadoActividad.REALIZADO, actividad.getEstado());
    }

    @Test
    void deberiaConservarTituloQueCabeExactamenteEnLaColumna() {
        String nombreMateria = "Á".repeat(255 - "Solicitaste ayuda en ".length());

        actividadService.registrarSolicitudAyuda(estudiante(11L), materia(44L, nombreMateria), estudiante(33L));

        ActividadEstudiante actividad = capturarActividadGuardada();
        assertEquals("Solicitaste ayuda en " + nombreMateria, actividad.getTitulo());
        assertEquals("Solicitud de ayuda enviada al ayudante Estudiante 33.", actividad.getDescripcion());
    }

    @Test
    void deberiaActualizarEstadoDeLaSolicitudPendiente() {
        Estudiante estudiante = estudiante(4L);
        Materia materia = materia(6L, "Cálculo I");
        ActividadEstudiante actividad = new ActividadEstudiante(
                estudiante,
                "Solicitar ser ayudante en Cálculo I",
                "Solicitud enviada a ser probada",
                LocalDateTime.now(),
                ActividadEstudiante.EstadoActividad.PENDIENTE
        );
        when(actividadRepository.findFirstByEstudianteIdAndTituloAndEstadoOrderByFechaHoraRegistroDesc(
                4L, "Solicitar ser ayudante en Cálculo I", ActividadEstudiante.EstadoActividad.PENDIENTE))
                .thenReturn(Optional.of(actividad));

        actividadService.actualizarEstadoSolicitudAyudante(
                estudiante, materia, ActividadEstudiante.EstadoActividad.APROBADA);

        assertEquals(ActividadEstudiante.EstadoActividad.APROBADA, actividad.getEstado());
        verify(actividadRepository).save(actividad);
    }

    @Test
    void deberiaInsertarActividadDesdeElEndpoint() {
        Estudiante estudiante = estudiante(7L);
        when(estudianteRepository.findById(7L)).thenReturn(Optional.of(estudiante));
        when(actividadRepository.save(any(ActividadEstudiante.class))).thenAnswer(invocation -> {
            ActividadEstudiante actividad = invocation.getArgument(0);
            ReflectionTestUtils.setField(actividad, "id", 10L);
            return actividad;
        });

        ActividadEstudianteResponse response = actividadService.insertar(new ActividadEstudianteRequest(
                7L,
                "Actividad manual",
                "Descripción manual",
                ActividadEstudiante.EstadoActividad.REALIZADO
        ));

        assertEquals(10L, response.id());
        assertEquals(7L, response.idEstudiante());
        assertEquals("Actividad manual", response.titulo());
        assertEquals("REALIZADO", response.estado());
    }

    @Test
    void deberiaActualizarUnaActividadExistente() {
        ActividadEstudiante actividad = new ActividadEstudiante(
                estudiante(8L), "Título anterior", "Descripción anterior", LocalDateTime.now(),
                ActividadEstudiante.EstadoActividad.PENDIENTE);
        when(actividadRepository.findById(20L)).thenReturn(Optional.of(actividad));
        when(actividadRepository.save(actividad)).thenReturn(actividad);

        ActividadEstudianteResponse response = actividadService.actualizar(20L, 8L,
                new ActividadEstudianteActualizacionRequest(
                        "Título nuevo", "Descripción nueva", ActividadEstudiante.EstadoActividad.APROBADA));

        assertEquals("Título nuevo", response.titulo());
        assertEquals("Descripción nueva", response.descripcion());
        assertEquals("APROBADA", response.estado());
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(longs = {99L})
    void deberiaRechazarActualizacionSinPropiedadAntesDeMutar(Long authenticatedStudentId) {
        LocalDateTime fecha = LocalDateTime.of(2026, 11, 7, 10, 30);
        ActividadEstudiante actividad = new ActividadEstudiante(
                estudiante(8L), "Título original", "Descripción original", fecha,
                ActividadEstudiante.EstadoActividad.PENDIENTE);
        when(actividadRepository.findById(20L)).thenReturn(Optional.of(actividad));

        assertThrows(AccesoNoAutorizadoException.class, () -> actividadService.actualizar(
                20L, authenticatedStudentId, new ActividadEstudianteActualizacionRequest(
                        "Título modificado", "Descripción modificada", ActividadEstudiante.EstadoActividad.APROBADA)));

        assertEquals("Título original", actividad.getTitulo());
        assertEquals("Descripción original", actividad.getDescripcion());
        assertEquals(ActividadEstudiante.EstadoActividad.PENDIENTE, actividad.getEstado());
        assertEquals(fecha, actividad.getFechaHoraRegistro());
        verify(actividadRepository, never()).save(any(ActividadEstudiante.class));
    }

    @Test
    void deberiaMostrarActividadesPorEstudiante() {
        Estudiante estudiante = estudiante(9L);
        ActividadEstudiante primera = new ActividadEstudiante(
                estudiante, "Primera", "Descripción", LocalDateTime.now(), ActividadEstudiante.EstadoActividad.REALIZADO);
        ActividadEstudiante segunda = new ActividadEstudiante(
                estudiante, "Segunda", "Descripción", LocalDateTime.now(), ActividadEstudiante.EstadoActividad.REALIZADO);
        when(estudianteRepository.existsById(9L)).thenReturn(true);
        when(actividadRepository.findByEstudianteIdOrderByFechaHoraRegistroDesc(9L))
                .thenReturn(List.of(primera, segunda));

        List<ActividadEstudianteResponse> response = actividadService.obtenerPorEstudiante(9L);

        assertEquals(2, response.size());
        assertEquals("Primera", response.get(0).titulo());
    }

    @Test
    void deberiaRechazarConsultaCuandoElEstudianteNoExiste() {
        when(estudianteRepository.existsById(99L)).thenReturn(false);

        ResourceNotFoundException excepcion = assertThrows(
                ResourceNotFoundException.class,
                () -> actividadService.obtenerPorEstudiante(99L)
        );

        assertEquals("El estudiante no existe", excepcion.getMessage());
        verify(actividadRepository, never()).findByEstudianteIdOrderByFechaHoraRegistroDesc(99L);
    }

    private ActividadEstudiante capturarActividadGuardada() {
        ArgumentCaptor<ActividadEstudiante> captor = ArgumentCaptor.forClass(ActividadEstudiante.class);
        verify(actividadRepository).save(captor.capture());
        return captor.getValue();
    }

    private Estudiante estudiante(Long id) {
        Estudiante estudiante = new Estudiante(
                "Estudiante " + id, "pass", "77700000", "estudiante" + id + "@ucb.edu.bo", "Ingeniería");
        ReflectionTestUtils.setField(estudiante, "id", id);
        return estudiante;
    }

    private Materia materia(Long id, String nombre) {
        Materia materia = new Materia("MAT" + id, nombre, "Ingeniería", 1);
        ReflectionTestUtils.setField(materia, "id", id);
        return materia;
    }

    private Docente docente(Long id, String nombre) {
        Docente docente = new Docente(nombre);
        ReflectionTestUtils.setField(docente, "id", id);
        return docente;
    }
}
