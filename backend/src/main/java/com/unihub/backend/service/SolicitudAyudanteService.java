package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import static com.unihub.backend.entity.Notificacion.TipoNotificacion.*;
import com.unihub.backend.dto.ayudante.SolicitudAyudanteRequest;
import com.unihub.backend.dto.ayudante.SolicitudAyudanteResponse;
import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudAyudante;
import com.unihub.backend.exception.SolicitudAyudanteDuplicadaException;
import com.unihub.backend.mapper.SolicitudAyudanteMapper;
import com.unihub.backend.repository.AyudanteMateriaRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.repository.SolicitudAyudanteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SolicitudAyudanteService {

    private final SolicitudAyudanteRepository solicitudAyudanteRepository;
    private final AyudanteMateriaRepository ayudanteMateriaRepository;
    private final EstudianteRepository estudianteRepository;
    private final MateriaRepository materiaRepository;
    private final SolicitudAyudanteMapper solicitudAyudanteMapper;

    private final NotificacionService notificacionService;

    public SolicitudAyudanteService(
            SolicitudAyudanteRepository solicitudAyudanteRepository,
            AyudanteMateriaRepository ayudanteMateriaRepository,
            EstudianteRepository estudianteRepository,
            MateriaRepository materiaRepository,
            SolicitudAyudanteMapper solicitudAyudanteMapper,
            NotificacionService notificacionService
    ) {
        this.solicitudAyudanteRepository = solicitudAyudanteRepository;
        this.ayudanteMateriaRepository = ayudanteMateriaRepository;
        this.estudianteRepository = estudianteRepository;
        this.materiaRepository = materiaRepository;
        this.solicitudAyudanteMapper = solicitudAyudanteMapper;
        this.notificacionService = notificacionService;
    }

    @Transactional
    public SolicitudAyudanteResponse solicitar(SolicitudAyudanteRequest request) {
        return solicitar(request, request.idEstudiante());
    }

    @Transactional
    public SolicitudAyudanteResponse solicitar(SolicitudAyudanteRequest request, Long estudianteId) {
        Estudiante estudiante = estudianteRepository.findById(estudianteId)
                .orElseThrow(() -> new IllegalArgumentException("El estudiante no existe"));
        Materia materia = materiaRepository.findById(request.idMateria())
                .orElseThrow(() -> new IllegalArgumentException("La materia no existe"));

        var estadosActivos = List.of(
                SolicitudAyudante.EstadoSolicitud.PENDIENTE,
                SolicitudAyudante.EstadoSolicitud.APROBADA
        );
        var estadosAyudanteActivos = List.of(
                AyudanteMateria.EstadoAyudante.PENDIENTE,
                AyudanteMateria.EstadoAyudante.APROBADO
        );

        if (solicitudAyudanteRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(
                estudianteId, request.idMateria(), estadosActivos)
                || ayudanteMateriaRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(
                estudianteId, request.idMateria(), estadosAyudanteActivos)) {
            throw new SolicitudAyudanteDuplicadaException("Ya tienes una solicitud pendiente o aprobada para esta materia.");
        }

        AyudanteMateria ayudanteMateria = AyudanteMateria.pendientePorSolicitud(
                estudiante, materia, request.horarios());
        ayudanteMateria = ayudanteMateriaRepository.save(ayudanteMateria);
        SolicitudAyudante solicitud = new SolicitudAyudante(
                estudiante, materia, request.motivo(), request.calificacion(), request.horarios());
        solicitud.asociarAyudanteMateria(ayudanteMateria);
        solicitud = solicitudAyudanteRepository.save(solicitud);
        notificacionService.crear(solicitud.getEstudiante(), POSTULACION_CREADA, "Postulación registrada",
                "Registramos tu postulación para " + solicitud.getMateria().getNombre(), "SOLICITUD_AYUDANTE", solicitud.getId());
        LogHelper.info(SolicitudAyudanteService.class, "Solicitud de ayudante creada por estudiante " + request.idEstudiante() + " para materia " + request.idMateria());
        return solicitudAyudanteMapper.toResponse(solicitud);
    }

    public List<SolicitudAyudanteResponse> obtenerPorEstudiante(Long estudianteId) {
        return solicitudAyudanteRepository.findByEstudianteId(estudianteId)
                .stream()
                .map(solicitudAyudanteMapper::toResponse)
                .toList();
    }

    public List<SolicitudAyudanteResponse> obtenerPorMateria(Long materiaId) {
        return solicitudAyudanteRepository.findByMateriaId(materiaId)
                .stream()
                .map(solicitudAyudanteMapper::toResponse)
                .toList();
    }

    public java.util.Optional<Long> obtenerIdPorAyudanteMateria(Long idAyudanteMateria) {
        List<Long> ids = solicitudAyudanteRepository.findIdsByAyudanteMateriaId(idAyudanteMateria);
        if (ids.size() > 1) {
            throw new IllegalStateException("Una asignación está vinculada a más de una solicitud; requiere reconciliación");
        }
        return ids.stream().findFirst();
    }

    public List<SolicitudAyudanteResponse> obtenerPendientes() {
        return solicitudAyudanteRepository.findByEstado(SolicitudAyudante.EstadoSolicitud.PENDIENTE)
                .stream()
                .map(solicitudAyudanteMapper::toResponse)
                .toList();
    }

    @Transactional
    public SolicitudAyudanteResponse aprobar(Long idSolicitud) {
        SolicitudAyudante solicitud = solicitudAyudanteRepository.findByIdForUpdate(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("La solicitud no existe"));

        AyudanteMateria relacion = exigirRelacionPendiente(solicitud);
        relacion.aprobar();
        solicitud.aprobar();
        ayudanteMateriaRepository.save(relacion);
        solicitud = solicitudAyudanteRepository.save(solicitud);
        notificacionService.crear(solicitud.getEstudiante(), POSTULACION_APROBADA, "Postulación aprobada",
                "Tu postulación fue aprobada para " + solicitud.getMateria().getNombre(), "SOLICITUD_AYUDANTE", solicitud.getId());
        LogHelper.info(SolicitudAyudanteService.class, "Solicitud de ayudante " + idSolicitud + " aprobada");
        return solicitudAyudanteMapper.toResponse(solicitud);
    }

    @Transactional
    public SolicitudAyudanteResponse rechazar(Long idSolicitud) {
        SolicitudAyudante solicitud = solicitudAyudanteRepository.findByIdForUpdate(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("La solicitud no existe"));

        AyudanteMateria relacion = exigirRelacionPendiente(solicitud);
        relacion.rechazar();
        solicitud.rechazar();
        ayudanteMateriaRepository.save(relacion);
        solicitud = solicitudAyudanteRepository.save(solicitud);
        notificacionService.crear(solicitud.getEstudiante(), POSTULACION_RECHAZADA, "Postulación rechazada",
                "Tu postulación fue rechazada para " + solicitud.getMateria().getNombre(), "SOLICITUD_AYUDANTE", solicitud.getId());
        LogHelper.info(SolicitudAyudanteService.class, "Solicitud de ayudante " + idSolicitud + " rechazada");
        return solicitudAyudanteMapper.toResponse(solicitud);
    }

    private AyudanteMateria exigirRelacionPendiente(SolicitudAyudante solicitud) {
        AyudanteMateria relacion = solicitud.getAyudanteMateria();
        if (relacion == null) {
            throw new IllegalStateException(
                    "La solicitud histórica no tiene una asignación asociada; requiere reconciliación manual");
        }
        if (solicitud.getEstado() != SolicitudAyudante.EstadoSolicitud.PENDIENTE
                || relacion.getEstado() != AyudanteMateria.EstadoAyudante.PENDIENTE) {
            throw new IllegalStateException("La solicitud y su asignación deben estar pendientes para decidirse");
        }
        return relacion;
    }
}
