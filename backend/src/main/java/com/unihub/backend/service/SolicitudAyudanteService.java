package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.ayudante.SolicitudAyudanteRequest;
import com.unihub.backend.dto.ayudante.SolicitudAyudanteResponse;
import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudAyudante;
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

    public SolicitudAyudanteService(
            SolicitudAyudanteRepository solicitudAyudanteRepository,
            AyudanteMateriaRepository ayudanteMateriaRepository,
            EstudianteRepository estudianteRepository,
            MateriaRepository materiaRepository,
            SolicitudAyudanteMapper solicitudAyudanteMapper
    ) {
        this.solicitudAyudanteRepository = solicitudAyudanteRepository;
        this.ayudanteMateriaRepository = ayudanteMateriaRepository;
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
        var estadosAyudanteActivos = List.of(
                AyudanteMateria.EstadoAyudante.PENDIENTE,
                AyudanteMateria.EstadoAyudante.APROBADO
        );

        if (solicitudAyudanteRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(
                request.idEstudiante(), request.idMateria(), estadosActivos)
                || ayudanteMateriaRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(
                request.idEstudiante(), request.idMateria(), estadosAyudanteActivos)) {
            throw new IllegalArgumentException("El estudiante ya tiene una solicitud pendiente o aprobada para esta materia");
        }

        SolicitudAyudante solicitud = new SolicitudAyudante(
                estudiante, materia, request.motivo(), request.calificacion(), request.horarios());
        solicitud = solicitudAyudanteRepository.save(solicitud);
        AyudanteMateria ayudanteMateria = new AyudanteMateria(estudiante, materia, request.horarios());
        ayudanteMateriaRepository.save(ayudanteMateria);
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
        actualizarEstadoRelacion(solicitud, AyudanteMateria.EstadoAyudante.APROBADO);
        solicitud = solicitudAyudanteRepository.save(solicitud);
        LogHelper.info(SolicitudAyudanteService.class, "Solicitud de ayudante " + idSolicitud + " aprobada");
        return solicitudAyudanteMapper.toResponse(solicitud);
    }

    @Transactional
    public SolicitudAyudanteResponse rechazar(Long idSolicitud) {
        SolicitudAyudante solicitud = solicitudAyudanteRepository.findById(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("La solicitud no existe"));

        solicitud.rechazar();
        actualizarEstadoRelacion(solicitud, AyudanteMateria.EstadoAyudante.RECHAZADO);
        solicitud = solicitudAyudanteRepository.save(solicitud);
        LogHelper.info(SolicitudAyudanteService.class, "Solicitud de ayudante " + idSolicitud + " rechazada");
        return solicitudAyudanteMapper.toResponse(solicitud);
    }

    private void actualizarEstadoRelacion(
            SolicitudAyudante solicitud,
            AyudanteMateria.EstadoAyudante nuevoEstado
    ) {
        AyudanteMateria relacion = ayudanteMateriaRepository.findByEstudianteIdAndMateriaIdAndEstado(
                solicitud.getEstudiante().getId(),
                solicitud.getMateria().getId(),
                AyudanteMateria.EstadoAyudante.PENDIENTE
        );
        if (relacion == null) {
            relacion = ayudanteMateriaRepository.findByEstudianteIdAndMateriaIdAndEstado(
                    solicitud.getEstudiante().getId(),
                    solicitud.getMateria().getId(),
                    AyudanteMateria.EstadoAyudante.APROBADO
            );
        }
        if (relacion != null) {
            relacion.setEstado(nuevoEstado);
            ayudanteMateriaRepository.save(relacion);
        }
    }
}