package com.unihub.backend.service;

import com.unihub.backend.dto.ayudante.SolicitudAyudaRequest;
import com.unihub.backend.entity.ActividadEstudiante;
import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.Notificacion;
import com.unihub.backend.entity.SolicitudAyuda;
import com.unihub.backend.mapper.ActividadEstudianteMapper;
import com.unihub.backend.mapper.NotificacionMapper;
import com.unihub.backend.mapper.SolicitudAyudaMapper;
import com.unihub.backend.repository.ActividadEstudianteRepository;
import com.unihub.backend.repository.AyudanteMateriaRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.repository.NotificacionRepository;
import com.unihub.backend.repository.SolicitudAyudaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Proxies y gestor transaccional reales con repositorios/conexión simulados; no prueba persistencia PostgreSQL. */
@SpringJUnitConfig(SolicitudAyudaTransaccionTest.Config.class)
class SolicitudAyudaTransaccionTest {
    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement
    @Import({SolicitudAyudaService.class, SolicitudAyudaMapper.class, ActividadEstudianteService.class,
            ActividadEstudianteMapper.class, NotificacionService.class, NotificacionMapper.class})
    static class Config {
        @Bean DataSource dataSource() { return mock(DataSource.class); }
        @Bean(destroyMethod = "") Connection connection() { return mock(Connection.class); }
        @Bean PlatformTransactionManager transactionManager(DataSource dataSource) {
            return new DataSourceTransactionManager(dataSource);
        }
        @Bean SolicitudAyudaRepository solicitudes() { return mock(SolicitudAyudaRepository.class); }
        @Bean EstudianteRepository estudiantes() { return mock(EstudianteRepository.class); }
        @Bean AyudanteMateriaRepository ayudantes() { return mock(AyudanteMateriaRepository.class); }
        @Bean MateriaRepository materias() { return mock(MateriaRepository.class); }
        @Bean ActividadEstudianteRepository actividades() { return mock(ActividadEstudianteRepository.class); }
        @Bean NotificacionRepository notificaciones() { return mock(NotificacionRepository.class); }
        @Bean JwtService jwtService() { return new JwtService(UUID.randomUUID().toString(), 3600); }
    }

    @Autowired private SolicitudAyudaService service;
    @Autowired private SolicitudAyudaRepository solicitudes;
    @Autowired private EstudianteRepository estudiantes;
    @Autowired private AyudanteMateriaRepository ayudantes;
    @Autowired private MateriaRepository materias;
    @Autowired private ActividadEstudianteRepository actividades;
    @Autowired private NotificacionRepository notificaciones;
    @Autowired private DataSource dataSource;
    @Autowired private Connection connection;

    private final Set<Object> recursos = Collections.newSetFromMap(new IdentityHashMap<>());
    private Estudiante solicitante;
    private Estudiante estudianteAyudante;
    private static final String PETICION = "Mensaje privado: revisar el ejercicio 5; llamar al 71234567.";
    private static final SolicitudAyudaRequest REQUEST = new SolicitudAyudaRequest(11L, 22L, 44L, PETICION);

    @BeforeEach
    void preparar() throws Exception {
        reset(solicitudes, estudiantes, ayudantes, materias, actividades, notificaciones, dataSource, connection);
        recursos.clear();
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getAutoCommit()).thenReturn(true);
        solicitante = new Estudiante("Ana Solicitante", "pass", "71234567", "ana@test.invalid", "Sistemas");
        estudianteAyudante = new Estudiante("Rocío Ayudante", "pass", "76543210", "rocio@test.invalid", "Sistemas");
        ReflectionTestUtils.setField(solicitante, "id", 11L);
        ReflectionTestUtils.setField(estudianteAyudante, "id", 33L);
        Materia materia = new Materia("MAT101", "Álgebra lineal", "Sistemas", 1);
        ReflectionTestUtils.setField(materia, "id", 44L);
        AyudanteMateria ayudante = new AyudanteMateria(estudianteAyudante, materia, "Lunes 10-12");
        ReflectionTestUtils.setField(ayudante, "id", 22L);
        ayudante.aprobar();
        when(estudiantes.findById(11L)).thenReturn(Optional.of(solicitante));
        when(ayudantes.findById(22L)).thenReturn(Optional.of(ayudante));
        when(materias.findById(44L)).thenReturn(Optional.of(materia));
        when(solicitudes.save(any(SolicitudAyuda.class))).thenAnswer(invocation -> {
            comprobarTransaccionExterior();
            SolicitudAyuda solicitud = invocation.getArgument(0);
            ReflectionTestUtils.setField(solicitud, "id", 55L);
            return solicitud;
        });
        when(notificaciones.save(any(Notificacion.class))).thenAnswer(invocation -> {
            comprobarTransaccionExterior();
            return invocation.getArgument(0);
        });
        when(actividades.save(any(ActividadEstudiante.class))).thenAnswer(invocation -> {
            comprobarTransaccionExterior();
            return invocation.getArgument(0);
        });
    }

    @Test
    void solicitudNotificacionYActividadCompartenUnaTransaccion() throws Exception {
        var response = service.solicitarAyuda(REQUEST);

        var actividadCaptor = ArgumentCaptor.forClass(ActividadEstudiante.class);
        var notificacionCaptor = ArgumentCaptor.forClass(Notificacion.class);
        var solicitudCaptor = ArgumentCaptor.forClass(SolicitudAyuda.class);
        var orden = inOrder(solicitudes, notificaciones, actividades);
        orden.verify(solicitudes).save(solicitudCaptor.capture());
        orden.verify(notificaciones).save(notificacionCaptor.capture());
        orden.verify(actividades).save(actividadCaptor.capture());
        verifyNoMoreInteractions(actividades, notificaciones);

        ActividadEstudiante actividad = actividadCaptor.getValue();
        assertSame(solicitante, actividad.getEstudiante());
        assertNotEquals(estudianteAyudante.getId(), actividad.getEstudiante().getId());
        assertEquals("Solicitaste ayuda en Álgebra lineal", actividad.getTitulo());
        assertEquals("Solicitud de ayuda enviada al ayudante Rocío Ayudante.", actividad.getDescripcion());
        assertEquals(ActividadEstudiante.EstadoActividad.REALIZADO, actividad.getEstado());
        String contenido = actividad.getTitulo() + actividad.getDescripcion();
        for (String privado : new String[]{PETICION, "ejercicio 5", solicitante.getTelefono(),
                estudianteAyudante.getTelefono(), solicitante.getCorreoElectronico(), estudianteAyudante.getCorreoElectronico()}) {
            assertFalse(contenido.contains(privado));
        }
        Notificacion aviso = notificacionCaptor.getValue();
        assertSame(estudianteAyudante, aviso.getEstudiante());
        assertEquals(Notificacion.TipoNotificacion.SOLICITUD_AYUDA_RECIBIDA, aviso.getTipo());
        assertEquals("SOLICITUD_AYUDA", aviso.getReferenciaTipo());
        assertEquals(55L, aviso.getReferenciaId());
        assertTrue(aviso.getMensaje().contains("Álgebra lineal"));
        assertEquals(SolicitudAyuda.EstadoSolicitudAyuda.RESUELTA, solicitudCaptor.getValue().getEstado());
        assertEquals("RESUELTA", response.estado());
        assertEquals(PETICION, response.peticion());
        assertEquals(11L, response.idEstudiante());
        assertEquals(22L, response.idAyudante());
        assertEquals("Rocío Ayudante", response.nombreAyudante());
        assertEquals(44L, response.idMateria());
        assertEquals(1, recursos.size());
        verify(dataSource, times(1)).getConnection();
        verify(connection, times(1)).commit();
        verify(connection, never()).rollback();
    }

    @ParameterizedTest
    @ValueSource(strings = {"solicitud", "notificacion", "actividad"})
    void falloDeCualquierEscrituraSolicitaRollbackDeLaTransaccionExterior(String escritura) throws Exception {
        var fallo = new DataIntegrityViolationException("Fallo simulado de " + escritura);
        switch (escritura) {
            case "solicitud" -> when(solicitudes.save(any(SolicitudAyuda.class))).thenThrow(fallo);
            case "notificacion" -> when(notificaciones.save(any(Notificacion.class))).thenThrow(fallo);
            case "actividad" -> when(actividades.save(any(ActividadEstudiante.class))).thenThrow(fallo);
        }

        assertSame(fallo, assertThrows(DataIntegrityViolationException.class, () -> service.solicitarAyuda(REQUEST)));
        verify(dataSource, times(1)).getConnection();
        verify(connection, times(1)).rollback();
        verify(connection, never()).commit();
        if (!escritura.equals("actividad")) verifyNoInteractions(actividades);
        if (escritura.equals("solicitud")) verifyNoInteractions(notificaciones);
    }

    private void comprobarTransaccionExterior() {
        assertTrue(TransactionSynchronizationManager.isActualTransactionActive());
        assertEquals(SolicitudAyudaService.class.getName() + ".solicitarAyuda",
                TransactionSynchronizationManager.getCurrentTransactionName());
        Object recurso = TransactionSynchronizationManager.getResource(dataSource);
        assertNotNull(recurso);
        recursos.add(recurso);
    }
}
