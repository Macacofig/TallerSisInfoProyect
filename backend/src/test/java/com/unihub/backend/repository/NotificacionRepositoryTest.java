package com.unihub.backend.repository;

import com.unihub.backend.integration.NotificacionPostgresSupport;
import com.unihub.backend.entity.Notificacion;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import java.time.Instant;
import static com.unihub.backend.entity.Notificacion.TipoNotificacion.*;
import static org.junit.jupiter.api.Assertions.*;

@org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable(named = "HU19_POSTGRES_TESTS", matches = "true")
class NotificacionRepositoryTest extends NotificacionPostgresSupport {
    @Test void ordenPaginacionPropiedadYLecturaGlobalEnPostgres() {
        var a = estudiante();
        var b = estudiante();
        var primera = notificaciones.saveAndFlush(new Notificacion(a, POSTULACION_CREADA, "Primera", "Mensaje", null, null));
        var segunda = notificaciones.saveAndFlush(new Notificacion(a, POSTULACION_APROBADA, "Segunda", "Mensaje", null, null));
        var ajena = notificaciones.saveAndFlush(new Notificacion(b, POSTULACION_CREADA, "Ajena", "Mensaje", null, null));
        // Same timestamp proves ID DESC is a deterministic tie-breaker.
        em.createNativeQuery("update notificaciones set fecha_creacion = :fecha where id_estudiante = :id")
                .setParameter("fecha", Instant.parse("2026-11-06T12:00:00Z")).setParameter("id", a.getId()).executeUpdate();
        em.clear();
        var page = notificaciones.findByEstudianteIdOrderByFechaCreacionDescIdDesc(a.getId(), PageRequest.of(0, 1));
        assertEquals(segunda.getId(), page.getContent().getFirst().getId());
        assertEquals(2, page.getTotalElements());
        assertTrue(page.hasNext());
        assertEquals(primera.getId(), notificaciones.findByEstudianteIdOrderByFechaCreacionDescIdDesc(
                a.getId(), PageRequest.of(1, 1)).getContent().getFirst().getId());
        assertTrue(notificaciones.findByIdAndEstudianteId(ajena.getId(), a.getId()).isEmpty());
        assertEquals(2, notificaciones.countByEstudianteIdAndLeidaFalse(a.getId()));
        servicio.marcarComoLeida(a.getId(), primera.getId());
        servicio.marcarComoLeida(a.getId(), primera.getId());
        em.flush(); em.clear();
        assertEquals(1, notificaciones.countByEstudianteIdAndLeidaFalse(a.getId()));
        servicio.marcarTodasComoLeidas(a.getId());
        assertEquals(0, notificaciones.countByEstudianteIdAndLeidaFalse(a.getId()));
        assertEquals(1, notificaciones.countByEstudianteIdAndLeidaFalse(b.getId()));
    }
}
