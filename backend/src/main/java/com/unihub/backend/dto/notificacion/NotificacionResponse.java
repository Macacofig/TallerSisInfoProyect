package com.unihub.backend.dto.notificacion;

import com.unihub.backend.entity.Notificacion.TipoNotificacion;
import java.time.Instant;

public record NotificacionResponse(Long id, TipoNotificacion tipo, String titulo, String mensaje,
        boolean leida, Instant fechaCreacion, String referenciaTipo, Long referenciaId) {}
