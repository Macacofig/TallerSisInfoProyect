package com.unihub.backend.service;

import com.unihub.backend.dto.notificacion.*;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Notificacion;
import com.unihub.backend.entity.Notificacion.TipoNotificacion;
import com.unihub.backend.exception.BadRequestException;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.NotificacionMapper;
import com.unihub.backend.repository.NotificacionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class NotificacionService {
    private final NotificacionRepository repository;
    private final NotificacionMapper mapper;

    public NotificacionService(NotificacionRepository repository, NotificacionMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public NotificacionResponse crear(Estudiante estudiante, TipoNotificacion tipo, String titulo,
                                     String mensaje, String referenciaTipo, Long referenciaId) {
        return mapper.toResponse(repository.save(new Notificacion(
                estudiante, tipo, titulo, mensaje, referenciaTipo, referenciaId)));
    }

    public NotificacionesPageResponse listar(Long estudianteId, int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BadRequestException("Página o tamaño inválidos (size: 1 a 100)");
        }
        var result = repository.findByEstudianteIdOrderByFechaCreacionDescIdDesc(
                estudianteId, PageRequest.of(page, size));
        return new NotificacionesPageResponse(result.getContent().stream().map(mapper::toResponse).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.hasNext());
    }

    public NotificacionesCountResponse contarNoLeidas(Long estudianteId) {
        return new NotificacionesCountResponse(repository.countByEstudianteIdAndLeidaFalse(estudianteId));
    }

    @Transactional
    public void marcarComoLeida(Long estudianteId, Long id) {
        var notificacion = repository.findByIdAndEstudianteId(id, estudianteId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada"));
        notificacion.marcarComoLeida();
    }

    @Transactional
    public void marcarTodasComoLeidas(Long estudianteId) {
        repository.marcarTodasComoLeidas(estudianteId);
    }
}
