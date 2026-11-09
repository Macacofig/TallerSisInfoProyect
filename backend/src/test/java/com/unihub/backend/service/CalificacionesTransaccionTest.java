package com.unihub.backend.service;

import com.unihub.backend.dto.calificacion.CalificacionDocenteRequest;
import com.unihub.backend.dto.calificacion.CalificacionMateriaRequest;
import com.unihub.backend.entity.ActividadEstudiante;
import com.unihub.backend.entity.CalificacionDocente;
import com.unihub.backend.entity.CalificacionMateria;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.exception.CalificacionDocenteDuplicadaException;
import com.unihub.backend.mapper.ActividadEstudianteMapper;
import com.unihub.backend.mapper.CalificacionDocenteMapper;
import com.unihub.backend.mapper.CalificacionMateriaMapper;
import com.unihub.backend.repository.ActividadEstudianteRepository;
import com.unihub.backend.repository.CalificacionDocenteRepository;
import com.unihub.backend.repository.CalificacionMateriaRepository;
import com.unihub.backend.repository.DocenteMateriaRepository;
import com.unihub.backend.repository.DocenteRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
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
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Proxies y gestor reales; repositorios y conexión simulados. No verifica rollback físico en PostgreSQL. */
@SpringJUnitConfig(CalificacionesTransaccionTest.Config.class)
class CalificacionesTransaccionTest {
    enum Tipo { MATERIA, DOCENTE }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement
    @Import({CalificacionMateriaService.class, CalificacionMateriaMapper.class, CalificacionDocenteService.class,
            CalificacionDocenteMapper.class, ActividadEstudianteService.class, ActividadEstudianteMapper.class})
    static class Config {
        @Bean DataSource dataSource() { return mock(DataSource.class); }
        @Bean(destroyMethod = "") Connection connection() { return mock(Connection.class); }
        @Bean PlatformTransactionManager transactionManager(DataSource dataSource) {
            return new DataSourceTransactionManager(dataSource);
        }
        @Bean CalificacionMateriaRepository calificacionesMateria() { return mock(CalificacionMateriaRepository.class); }
        @Bean CalificacionDocenteRepository calificacionesDocente() { return mock(CalificacionDocenteRepository.class); }
        @Bean ActividadEstudianteRepository actividades() { return mock(ActividadEstudianteRepository.class); }
        @Bean MateriaRepository materias() { return mock(MateriaRepository.class); }
        @Bean DocenteRepository docentes() { return mock(DocenteRepository.class); }
        @Bean DocenteMateriaRepository docenteMaterias() { return mock(DocenteMateriaRepository.class); }
        @Bean EstudianteRepository estudiantes() { return mock(EstudianteRepository.class); }
        @Bean JwtService jwtService() { return new JwtService(UUID.randomUUID().toString(), 3600); }
    }

    @Autowired private CalificacionMateriaService materiaService;
    @Autowired private CalificacionDocenteService docenteService;
    @Autowired private CalificacionMateriaRepository calificacionesMateria;
    @Autowired private CalificacionDocenteRepository calificacionesDocente;
    @Autowired private ActividadEstudianteRepository actividades;
    @Autowired private MateriaRepository materias;
    @Autowired private DocenteRepository docentes;
    @Autowired private DocenteMateriaRepository docenteMaterias;
    @Autowired private EstudianteRepository estudiantes;
    @Autowired private DataSource dataSource;
    @Autowired private Connection connection;

    private final Set<Object> recursos = Collections.newSetFromMap(new IdentityHashMap<>());
    private Estudiante estudiante;
    private Tipo tipoActual;

    @BeforeEach
    void preparar() throws Exception {
        reset(calificacionesMateria, calificacionesDocente, actividades, materias, docentes,
                docenteMaterias, estudiantes, dataSource, connection);
        recursos.clear();
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getAutoCommit()).thenReturn(true);
        estudiante = new Estudiante("Ana", "pass", "71234567", "ana@test.invalid", "Sistemas");
        ReflectionTestUtils.setField(estudiante, "id", 11L);
        Materia materia = new Materia("MAT101", "Álgebra lineal", "Sistemas", 1);
        ReflectionTestUtils.setField(materia, "id", 22L);
        Docente docente = new Docente("Rocío Docente");
        ReflectionTestUtils.setField(docente, "id", 33L);
        when(estudiantes.findById(11L)).thenReturn(Optional.of(estudiante));
        when(materias.findById(22L)).thenReturn(Optional.of(materia));
        when(docentes.findById(33L)).thenReturn(Optional.of(docente));
        when(docenteMaterias.existsByDocenteIdAndMateriaId(33L, 22L)).thenReturn(true);
        when(calificacionesMateria.save(any(CalificacionMateria.class))).thenAnswer(invocation -> {
            comprobarTransaccionExterior();
            return invocation.getArgument(0);
        });
        when(calificacionesDocente.save(any(CalificacionDocente.class))).thenAnswer(invocation -> {
            comprobarTransaccionExterior();
            return invocation.getArgument(0);
        });
        when(actividades.save(any(ActividadEstudiante.class))).thenAnswer(invocation -> {
            comprobarTransaccionExterior();
            return invocation.getArgument(0);
        });
    }

    @ParameterizedTest
    @EnumSource(Tipo.class)
    void exitoGuardaUnaCalificacionYUnaActividadEnLaMismaTransaccion(Tipo tipo) throws Exception {
        crear(tipo, 11L);

        var captor = ArgumentCaptor.forClass(ActividadEstudiante.class);
        if (tipo == Tipo.MATERIA) {
            var orden = inOrder(calificacionesMateria, actividades);
            orden.verify(calificacionesMateria).save(any(CalificacionMateria.class));
            orden.verify(actividades).save(captor.capture());
            verifyNoInteractions(calificacionesDocente);
        } else {
            var orden = inOrder(calificacionesDocente, actividades);
            orden.verify(calificacionesDocente).save(any(CalificacionDocente.class));
            orden.verify(actividades).save(captor.capture());
            verifyNoInteractions(calificacionesMateria);
        }
        verifyNoMoreInteractions(actividades);
        assertSame(estudiante, captor.getValue().getEstudiante());
        assertEquals(ActividadEstudiante.EstadoActividad.REALIZADO, captor.getValue().getEstado());
        assertEquals(1, recursos.size());
        verify(dataSource, times(1)).getConnection();
        verify(connection, times(1)).commit();
        verify(connection, never()).rollback();
    }

    @ParameterizedTest
    @EnumSource(Tipo.class)
    void falloDeActividadSolicitaRollbackDeTodaLaCreacion(Tipo tipo) throws Exception {
        var fallo = new DataIntegrityViolationException("Fallo de actividad simulado");
        when(actividades.save(any(ActividadEstudiante.class))).thenAnswer(invocation -> {
            comprobarTransaccionExterior();
            throw fallo;
        });

        assertSame(fallo, assertThrows(DataIntegrityViolationException.class, () -> crear(tipo, 11L)));

        if (tipo == Tipo.MATERIA) verify(calificacionesMateria).save(any(CalificacionMateria.class));
        else verify(calificacionesDocente).save(any(CalificacionDocente.class));
        verify(actividades).save(any(ActividadEstudiante.class));
        assertEquals(1, recursos.size());
        verify(dataSource, times(1)).getConnection();
        verify(connection, times(1)).rollback();
        verify(connection, never()).commit();
    }

    @ParameterizedTest
    @EnumSource(Tipo.class)
    void materiaInexistenteNoGuardaCalificacionNiActividad(Tipo tipo) {
        when(materias.findById(22L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> crear(tipo, 11L));

        comprobarSinEscrituras();
    }

    @ParameterizedTest
    @EnumSource(Tipo.class)
    void estudianteInexistenteNoGuardaCalificacionNiActividad(Tipo tipo) {
        when(estudiantes.findById(11L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> crear(tipo, 11L));

        comprobarSinEscrituras();
    }

    @ParameterizedTest
    @EnumSource(Tipo.class)
    void estudianteOpcionalConservaReglaExistenteSinCrearActividad(Tipo tipo) throws Exception {
        crear(tipo, null);

        verifyNoInteractions(actividades);
        verify(connection).commit();
    }

    @Test
    void docenteAjenoALaMateriaNoGeneraActividad() {
        when(docenteMaterias.existsByDocenteIdAndMateriaId(33L, 22L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> crear(Tipo.DOCENTE, 11L));

        comprobarSinEscrituras();
    }

    @Test
    void docenteInexistenteNoGeneraActividad() {
        when(docentes.findById(33L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> crear(Tipo.DOCENTE, 11L));

        comprobarSinEscrituras();
    }

    @Test
    void evaluacionDuplicadaNoGeneraActividad() {
        when(calificacionesDocente.findFirstByEstudiante_IdAndDocenteIdAndMateriaId(11L, 33L, 22L))
                .thenReturn(Optional.of(mock(CalificacionDocente.class)));

        assertThrows(CalificacionDocenteDuplicadaException.class, () -> crear(Tipo.DOCENTE, 11L));

        comprobarSinEscrituras();
    }

    private void crear(Tipo tipo, Long estudianteId) {
        tipoActual = tipo;
        if (tipo == Tipo.MATERIA) {
            materiaService.crear(new CalificacionMateriaRequest(
                    22L, estudianteId, 8, 7, 9, List.of("Lógica"), "Practico", "I-Año"));
        } else {
            docenteService.crear(new CalificacionDocenteRequest(33L, 22L, estudianteId, 8, 7, 9, "año-I"));
        }
    }

    private void comprobarSinEscrituras() {
        verify(calificacionesMateria, never()).save(any(CalificacionMateria.class));
        verify(calificacionesDocente, never()).save(any(CalificacionDocente.class));
        verifyNoInteractions(actividades);
    }

    private void comprobarTransaccionExterior() {
        assertTrue(TransactionSynchronizationManager.isActualTransactionActive());
        Class<?> servicio = tipoActual == Tipo.MATERIA ? CalificacionMateriaService.class : CalificacionDocenteService.class;
        assertEquals(servicio.getName() + ".crear", TransactionSynchronizationManager.getCurrentTransactionName());
        Object recurso = TransactionSynchronizationManager.getResource(dataSource);
        assertNotNull(recurso);
        recursos.add(recurso);
    }
}
