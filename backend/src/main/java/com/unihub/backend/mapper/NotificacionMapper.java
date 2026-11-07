package com.unihub.backend.mapper;

import com.unihub.backend.dto.notificacion.NotificacionResponse;
import com.unihub.backend.entity.Notificacion;
import org.springframework.stereotype.Component;

@Component
public class NotificacionMapper {
    public NotificacionResponse toResponse(Notificacion n) {
        return new NotificacionResponse(n.getId(), n.getTipo(), n.getTitulo(), n.getMensaje(),
                n.isLeida(), n.getFechaCreacion(), n.getReferenciaTipo(), n.getReferenciaId());
    }
}
