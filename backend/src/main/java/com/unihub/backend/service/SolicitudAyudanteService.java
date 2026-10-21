package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.ayudante.SolicitudAyudanteRequest;
import com.unihub.backend.dto.ayudante.SolicitudAyudanteResponse;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudAyudante;
import com.unihub.backend.mapper.SolicitudAyudanteMapper;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.repository.SolicitudAyudanteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SolicitudAyudanteService {

    private final SolicitudAyudanteRepository solicitudAyudanteRepository;
    private final EstudianteRepository estudianteRepository;
    private final MateriaRepository materiaRepository;
    private final SolicitudAyudanteMapper solicitudAyudanteMapper;

    public SolicitudAyudanteService(
            SolicitudAyudanteRepository solicitudAyudanteRepository,
            EstudianteRepository estudianteRepository,
            MateriaRepository materiaRepository,
            SolicitudAyudanteMapper solicitudAyudanteMapper
    ) {
        this.solicitudAyudanteRepository = solicitudAyudanteRepository;
        this.estudianteRepository = estudianteRepository;
        this.materiaRepository = materiaRepository;
        this.solicitudAyudanteMapper = solicitudAyudanteMapper;
    }

    @Transactional
    public SolicitudAyudanteResponse solicitar(SolicitudAyudanteRequest request) {
        Estudiante estudiante = estudianteRepository.findById(request.idEstudiante())
                .orElseThrow(() -> new IllegalArgumentException("El estudiante no existe"));
        Materia materia = materiaRepository.findById(request.idMateria())
                .orElseThrow(() -> new IllegalArgumentException("La materia no existe"));

        var estadosActivos = List.of(
                SolicitudAyudante.EstadoSolicitud.PENDIENTE,
                SolicitudAyudante.EstadoSolicitud.APROBADA
        );

        if (solicitudAyudanteRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(
                request.idEstudiante(), request.idMateria(), estadosActivos)) {
            throw new IllegalArgumentException("El estudiante ya tiene una solicitud pendiente o aprobada para esta materia");
        }

        SolicitudAyudante solicitud = new SolicitudAyudante(
                estudiante, materia, request.motivo(), request.calificacion(), request.horarios());
        solicitud = solicitudAyudanteRepository.save(solicitud);
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

    public List<SolicitudAyudanteResponse> obtenerPendientes() {
        return solicitudAyudanteRepository.findByEstado(SolicitudAyudante.EstadoSolicitud.PENDIENTE)
                .stream()
                .map(solicitudAyudanteMapper::toResponse)
                .toList();
    }

    @Transactional
    public SolicitudAyudanteResponse aprobar(Long idSolicitud) {
        SolicitudAyudante solicitud = solicitudAyudanteRepository.findById(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("La solicitud no existe"));

        solicitud.aprobar();
        solicitud = solicitudAyudanteRepository.save(solicitud);
        LogHelper.info(SolicitudAyudanteService.class, "Solicitud de ayudante " + idSolicitud + " aprobada");
        return solicitudAyudanteMapper.toResponse(solicitud);
    }

    @Transactional
    public SolicitudAyudanteResponse rechazar(Long idSolicitud) {
        SolicitudAyudante solicitud = solicitudAyudanteRepository.findById(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("La solicitud no existe"));

        solicitud.rechazar();
        solicitud = solicitudAyudanteRepository.save(solicitud);
        LogHelper.info(SolicitudAyudanteService.class, "Solicitud de ayudante " + idSolicitud + " rechazada");
        return solicitudAyudanteMapper.toResponse(solicitud);
    }
}