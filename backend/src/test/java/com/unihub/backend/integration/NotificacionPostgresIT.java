package com.unihub.backend.integration;

import com.unihub.backend.dto.ayudante.*;
import com.unihub.backend.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import java.nio.file.*;
import static com.unihub.backend.entity.Notificacion.TipoNotificacion.*;
import static org.junit.jupiter.api.Assertions.*;

@org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable(named = "HU19_POSTGRES_TESTS", matches = "true")
class NotificacionPostgresIT extends NotificacionPostgresSupport {
    @Autowired PlatformTransactionManager transactionManager;

    @Test void eventosPersistenYDelegacionNoDuplica() {
        var a = estudiante(); var b = estudiante(); var m = materia();
        var solicitud = postulaciones.solicitar(new SolicitudAyudanteRequest(a.getId(), m.getId(), "Apoyar", 9.0, "Lunes"));
        assertEquals(POSTULACION_CREADA, servicio.listar(a.getId(), 0, 20).content().getFirst().tipo());
        Long relacion = solicitudes.findById(solicitud.id()).orElseThrow().getAyudanteMateria().getId();
        ayudantes.aprobarSolicitud(relacion);
        em.flush(); em.clear();
        var avisos = servicio.listar(a.getId(), 0, 20);
        assertEquals(2, avisos.totalElements());
        assertEquals(POSTULACION_APROBADA, avisos.content().getFirst().tipo());
        assertEquals(solicitud.id(), avisos.content().getFirst().referenciaId());
        var rechazada = postulaciones.solicitar(new SolicitudAyudanteRequest(b.getId(), m.getId(), "Apoyar", 9.0, "Martes"));
        postulaciones.rechazar(rechazada.id());
        assertEquals(POSTULACION_RECHAZADA, servicio.listar(b.getId(), 0, 20).content().getFirst().tipo());
        var ayuda = ayudas.solicitarAyuda(new SolicitudAyudaRequest(b.getId(), relacion, m.getId(), "Necesito ayuda"));
        em.flush(); em.clear();
        var recibida = servicio.listar(a.getId(), 0, 20).content().getFirst();
        assertEquals(SOLICITUD_AYUDA_RECIBIDA, recibida.tipo());
        assertEquals(ayuda.id(), recibida.referenciaId());
        assertTrue(recibida.mensaje().contains("Materia HU19"));
        assertEquals(2, servicio.listar(b.getId(), 0, 20).totalElements());
        assertEquals("RESUELTA", ayuda.estado());
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void rollbackRevierteOperacionYNotificacion() {
        var tx = new TransactionTemplate(transactionManager);
        long antes = notificaciones.count();
        long solicitudesAntes = solicitudes.count();
        assertThrows(IllegalStateException.class, () -> tx.executeWithoutResult(status -> {
            var a = estudiante(); var m = materia();
            postulaciones.solicitar(new SolicitudAyudanteRequest(a.getId(), m.getId(), "Apoyar", 9.0, "Lunes"));
            em.flush();
            assertEquals(antes + 1, notificaciones.count());
            throw new IllegalStateException("Fallo posterior al guardado");
        }));
        assertEquals(antes, notificaciones.count());
        assertEquals(solicitudesAntes, solicitudes.count());
    }

    @Test void migracionRealTieneDefaultsChecksIndicesYCascada() throws Exception {
        // DDL and fixtures are rolled back by the test transaction.
        em.createNativeQuery("drop table notificaciones").executeUpdate();
        String sql = Files.readString(Path.of("../scripts/migrations/V20261106__create_notificaciones.sql"));
        sql = sql.replaceAll("(?m)^--.*$", "");
        for (String statement : sql.split(";")) {
            String s = statement.trim();
            if (!s.isEmpty() && !s.equals("BEGIN") && !s.equals("COMMIT")) em.createNativeQuery(s).executeUpdate();
        }
        var a = estudiante();
        Number id = (Number) em.createNativeQuery("""
                insert into notificaciones(id_estudiante,tipo,titulo,mensaje)
                values (:id,'POSTULACION_CREADA','Título','Mensaje') returning id
                """).setParameter("id", a.getId()).getSingleResult();
        em.clear();
        var n = notificaciones.findById(id.longValue()).orElseThrow();
        assertFalse(n.isLeida()); assertNotNull(n.getFechaCreacion());
        Number indices = (Number) em.createNativeQuery("select count(*) from pg_indexes where tablename='notificaciones' and indexname like 'idx_notificaciones_%'").getSingleResult();
        assertEquals(2, indices.intValue());
        Number checks = (Number) em.createNativeQuery("select count(*) from pg_constraint where conrelid='notificaciones'::regclass and contype='c'").getSingleResult();
        assertEquals(4, checks.intValue());
        em.createNativeQuery("delete from estudiantes where id=:id").setParameter("id", a.getId()).executeUpdate();
        em.clear();
        assertFalse(notificaciones.existsById(id.longValue()));
    }
}
