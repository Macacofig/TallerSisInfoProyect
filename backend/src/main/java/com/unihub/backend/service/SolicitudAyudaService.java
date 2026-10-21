package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.ayudante.SolicitudAyudaRequest;
import com.unihub.backend.dto.ayudante.SolicitudAyudaResponse;
import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudAyuda;
import com.unihub.backend.mapper.SolicitudAyudaMapper;
import com.unihub.backend.repository.AyudanteMateriaRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.repository.SolicitudAyudaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SolicitudAyudaService {

    private final SolicitudAyudaRepository solicitudAyudaRepository;
    private final EstudianteRepository estudianteRepository;
    private final AyudanteMateriaRepository ayudanteMateriaRepository;
    private final MateriaRepository materiaRepository;
    private final SolicitudAyudaMapper solicitudAyudaMapper;

    public SolicitudAyudaService(
            SolicitudAyudaRepository solicitudAyudaRepository,
            EstudianteRepository estudianteRepository,
            AyudanteMateriaRepository ayudanteMateriaRepository,
            MateriaRepository materiaRepository,
            SolicitudAyudaMapper solicitudAyudaMapper
    ) {
        this.solicitudAyudaRepository = solicitudAyudaRepository;
        this.estudianteRepository = estudianteRepository;
        this.ayudanteMateriaRepository = ayudanteMateriaRepository;
        this.materiaRepository = materiaRepository;
        this.solicitudAyudaMapper = solicitudAyudaMapper;
    }

    @Transactional
    public SolicitudAyudaResponse solicitarAyuda(SolicitudAyudaRequest request) {
        Estudiante estudiante = estudianteRepository.findById(request.idEstudiante())
                .orElseThrow(() -> new IllegalArgumentException("El estudiante no existe"));
        AyudanteMateria ayudante = ayudanteMateriaRepository.findById(request.idAyudante())
                .orElseThrow(() -> new IllegalArgumentException("El ayudante no existe"));
        Materia materia = materiaRepository.findById(request.idMateria())
                .orElseThrow(() -> new IllegalArgumentException("La materia no existe"));

        if (!ayudante.getMateria().getId().equals(request.idMateria())) {
            throw new IllegalArgumentException("El ayudante no pertenece a la materia especificada");
        }

        if (ayudante.getEstado() != AyudanteMateria.EstadoAyudante.APROBADO) {
            throw new IllegalArgumentException("El ayudante debe estar aprobado para recibir solicitudes de ayuda");
        }

        SolicitudAyuda solicitud = new SolicitudAyuda(estudiante, ayudante, materia, request.peticion());
        solicitud = solicitudAyudaRepository.save(solicitud);
        LogHelper.info(SolicitudAyudaService.class, "Solicitud de ayuda creada por estudiante " + request.idEstudiante() + " para ayudante " + request.idAyudante() + " en materia " + request.idMateria());
        return solicitudAyudaMapper.toResponse(solicitud);
    }

    public List<SolicitudAyudaResponse> obtenerPorAyudante(Long ayudanteId) {
        return solicitudAyudaRepository.findByAyudanteId(ayudanteId)
                .stream()
                .map(solicitudAyudaMapper::toResponse)
                .toList();
    }

    public List<SolicitudAyudaResponse> obtenerPorEstudiante(Long estudianteId) {
        return solicitudAyudaRepository.findByEstudianteId(estudianteId)
                .stream()
                .map(solicitudAyudaMapper::toResponse)
                .toList();
    }

    public List<SolicitudAyudaResponse> obtenerPendientesPorAyudante(Long ayudanteId) {
        return solicitudAyudaRepository.findByAyudanteIdAndEstado(ayudanteId, SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE)
                .stream()
                .map(solicitudAyudaMapper::toResponse)
                .toList();
    }

    @Transactional
    public SolicitudAyudaResponse resolver(Long idSolicitud) {
        SolicitudAyuda solicitud = solicitudAyudaRepository.findById(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("La solicitud no existe"));

        solicitud.resolver();
        solicitud = solicitudAyudaRepository.save(solicitud);
        LogHelper.info(SolicitudAyudaService.class, "Solicitud de ayuda " + idSolicitud + " resuelta");
        return solicitudAyudaMapper.toResponse(solicitud);
    }

    @Transactional
    public SolicitudAyudaResponse cancelar(Long idSolicitud, Long idEstudiante) {
        SolicitudAyuda solicitud = solicitudAyudaRepository.findById(idSolicitud)
                .orElseThrow(() -> new IllegalArgumentException("La solicitud no existe"));

        if (!solicitud.getEstudiante().getId().equals(idEstudiante)) {
            throw new IllegalArgumentException("No tienes permiso para cancelar esta solicitud");
        }

        solicitud.cancelar();
        solicitud = solicitudAyudaRepository.save(solicitud);
        LogHelper.info(SolicitudAyudaService.class, "Solicitud de ayuda " + idSolicitud + " cancelada por estudiante " + idEstudiante);
        return solicitudAyudaMapper.toResponse(solicitud);
    }
}