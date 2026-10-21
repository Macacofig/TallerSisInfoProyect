package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.ayudante.AyudanteMateriaRequest;
import com.unihub.backend.dto.ayudante.AyudanteMateriaResponse;
import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.mapper.AyudanteMateriaMapper;
import com.unihub.backend.repository.AyudanteMateriaRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AyudanteMateriaService {

    private final AyudanteMateriaRepository ayudanteMateriaRepository;
    private final EstudianteRepository estudianteRepository;
    private final MateriaRepository materiaRepository;
    private final AyudanteMateriaMapper ayudanteMateriaMapper;

    public AyudanteMateriaService(
            AyudanteMateriaRepository ayudanteMateriaRepository,
            EstudianteRepository estudianteRepository,
            MateriaRepository materiaRepository,
            AyudanteMateriaMapper ayudanteMateriaMapper
    ) {
        this.ayudanteMateriaRepository = ayudanteMateriaRepository;
        this.estudianteRepository = estudianteRepository;
        this.materiaRepository = materiaRepository;
        this.ayudanteMateriaMapper = ayudanteMateriaMapper;
    }

    @Transactional
    public AyudanteMateriaResponse crear(AyudanteMateriaRequest request) {
        Estudiante estudiante = estudianteRepository.findById(request.idEstudiante())
                .orElseThrow(() -> new IllegalArgumentException("El estudiante no existe"));
        Materia materia = materiaRepository.findById(request.idMateria())
                .orElseThrow(() -> new IllegalArgumentException("La materia no existe"));

        var estadosActivos = List.of(
                AyudanteMateria.EstadoAyudante.PENDIENTE,
                AyudanteMateria.EstadoAyudante.APROBADO
        );

        if (ayudanteMateriaRepository.existsByEstudianteIdAndMateriaIdAndEstadoIn(
                request.idEstudiante(), request.idMateria(), estadosActivos)) {
            throw new IllegalArgumentException("El estudiante ya tiene una solicitud pendiente o aprobada para esta materia");
        }

        AyudanteMateria ayudanteMateria = new AyudanteMateria(estudiante, materia, request.horario());
        ayudanteMateria = ayudanteMateriaRepository.save(ayudanteMateria);
        LogHelper.info(AyudanteMateriaService.class, "Solicitud de ayudante creada para estudiante " + request.idEstudiante() + " en materia " + request.idMateria());
        return ayudanteMateriaMapper.toResponse(ayudanteMateria);
    }

    public List<AyudanteMateriaResponse> obtenerAyudantesAprobadosPorMateria(Long materiaId) {
        Materia materia = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new IllegalArgumentException("La materia no existe"));

        return ayudanteMateriaRepository.findByMateriaIdAndEstado(materiaId, AyudanteMateria.EstadoAyudante.APROBADO)
                .stream()
                .map(ayudanteMateriaMapper::toResponse)
                .toList();
    }

    @Transactional
    public void dejarDeSerAyudante(Long idAyudanteMateria, Long idEstudiante) {
        AyudanteMateria ayudanteMateria = ayudanteMateriaRepository.findById(idAyudanteMateria)
                .orElseThrow(() -> new IllegalArgumentException("La relación ayudante-materia no existe"));

        if (!ayudanteMateria.getEstudiante().getId().equals(idEstudiante)) {
            throw new IllegalArgumentException("No tienes permiso para realizar esta acción");
        }

        if (ayudanteMateria.getEstado() != AyudanteMateria.EstadoAyudante.APROBADO) {
            throw new IllegalStateException("Solo se puede dejar de ser ayudante si el estado es APROBADO");
        }

        ayudanteMateria.dejarDeSerAyudante();
        ayudanteMateriaRepository.save(ayudanteMateria);
        LogHelper.info(AyudanteMateriaService.class, "Estudiante " + idEstudiante + " dejó de ser ayudante en materia " + ayudanteMateria.getMateria().getId());
    }

    @Transactional
    public AyudanteMateriaResponse aprobarSolicitud(Long idAyudanteMateria) {
        AyudanteMateria ayudanteMateria = ayudanteMateriaRepository.findById(idAyudanteMateria)
                .orElseThrow(() -> new IllegalArgumentException("La solicitud no existe"));

        ayudanteMateria.aprobar();
        ayudanteMateria = ayudanteMateriaRepository.save(ayudanteMateria);
        LogHelper.info(AyudanteMateriaService.class, "Solicitud de ayudante " + idAyudanteMateria + " aprobada");
        return ayudanteMateriaMapper.toResponse(ayudanteMateria);
    }

    @Transactional
    public AyudanteMateriaResponse rechazarSolicitud(Long idAyudanteMateria) {
        AyudanteMateria ayudanteMateria = ayudanteMateriaRepository.findById(idAyudanteMateria)
                .orElseThrow(() -> new IllegalArgumentException("La solicitud no existe"));

        ayudanteMateria.rechazar();
        ayudanteMateria = ayudanteMateriaRepository.save(ayudanteMateria);
        LogHelper.info(AyudanteMateriaService.class, "Solicitud de ayudante " + idAyudanteMateria + " rechazada");
        return ayudanteMateriaMapper.toResponse(ayudanteMateria);
    }

    public List<AyudanteMateriaResponse> obtenerSolicitudesPendientes() {
        return ayudanteMateriaRepository.findByEstado(AyudanteMateria.EstadoAyudante.PENDIENTE)
                .stream()
                .map(ayudanteMateriaMapper::toResponse)
                .toList();
    }
}