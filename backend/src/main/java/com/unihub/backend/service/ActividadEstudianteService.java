package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.actividad.ActividadEstudianteActualizacionRequest;
import com.unihub.backend.dto.actividad.ActividadEstudianteRequest;
import com.unihub.backend.dto.actividad.ActividadEstudianteResponse;
import com.unihub.backend.entity.ActividadEstudiante;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.ActividadEstudianteMapper;
import com.unihub.backend.repository.ActividadEstudianteRepository;
import com.unihub.backend.repository.EstudianteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class ActividadEstudianteService {

    private static final ZoneId ZONA_HORARIA_BOLIVIA = ZoneId.of("America/La_Paz");
    private static final String TITULO_CALIFICAR_MATERIA = "Calificar materia";
    private static final String TITULO_CALIFICAR_DOCENTE = "Calificar docente";
    private static final String DESCRIPCION_CALIFICAR_MATERIA = "Calificación a materia";
    private static final String DESCRIPCION_CALIFICAR_DOCENTE = "Calificación a docente";
    private static final String DESCRIPCION_SOLICITUD_AYUDANTE = "Solicitud enviada a ser probada";

    private final ActividadEstudianteRepository actividadRepository;
    private final EstudianteRepository estudianteRepository;
    private final ActividadEstudianteMapper actividadMapper;
    private final JwtService jwtService;

    public ActividadEstudianteService(
            ActividadEstudianteRepository actividadRepository,
            EstudianteRepository estudianteRepository,
            ActividadEstudianteMapper actividadMapper,
            JwtService jwtService
    ) {
        this.actividadRepository = actividadRepository;
        this.estudianteRepository = estudianteRepository;
        this.actividadMapper = actividadMapper;
        this.jwtService = jwtService;
    }

    @Transactional
    public ActividadEstudianteResponse insertar(ActividadEstudianteRequest request) {
        Estudiante estudiante = estudianteRepository.findById(request.idEstudiante())
                .orElseThrow(() -> new ResourceNotFoundException("El estudiante no existe"));

        ActividadEstudiante actividad = new ActividadEstudiante(
                estudiante,
                request.titulo(),
                request.descripcion(),
                fechaActualBolivia(),
                request.estado()
        );
        ActividadEstudianteResponse response = actividadMapper.toResponse(actividadRepository.save(actividad));
        LogHelper.info(ActividadEstudianteService.class, "Actividad de estudiante registrada correctamente");
        return response;
    }

    @Transactional
    public ActividadEstudianteResponse actualizar(
            Long id, Long authenticatedStudentId, ActividadEstudianteActualizacionRequest request
    ) {
        ActividadEstudiante actividad = actividadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La actividad no existe"));

        jwtService.verificarPropiedad(authenticatedStudentId, actividad.getEstudiante().getId());
        actividad.actualizar(request.titulo(), request.descripcion(), request.estado());
        ActividadEstudianteResponse response = actividadMapper.toResponse(actividadRepository.save(actividad));
        LogHelper.info(ActividadEstudianteService.class, "Actividad de estudiante actualizada correctamente");
        return response;
    }

    @Transactional(readOnly = true)
    public List<ActividadEstudianteResponse> obtenerPorEstudiante(Long idEstudiante) {
        if (!estudianteRepository.existsById(idEstudiante)) {
            throw new ResourceNotFoundException("El estudiante no existe");
        }
        return actividadRepository.findByEstudianteIdOrderByFechaHoraRegistroDesc(idEstudiante)
                .stream()
                .map(actividadMapper::toResponse)
                .toList();
    }

    @Transactional
    public void registrarCalificacionMateria(Estudiante estudiante) {
        if (estudiante == null) {
            return;
        }
        registrarActividad(
                estudiante,
                TITULO_CALIFICAR_MATERIA,
                DESCRIPCION_CALIFICAR_MATERIA,
                ActividadEstudiante.EstadoActividad.REALIZADO
        );
    }

    @Transactional
    public void registrarCalificacionDocente(Estudiante estudiante) {
        if (estudiante == null) {
            return;
        }
        registrarActividad(
                estudiante,
                TITULO_CALIFICAR_DOCENTE,
                DESCRIPCION_CALIFICAR_DOCENTE,
                ActividadEstudiante.EstadoActividad.REALIZADO
        );
    }

    @Transactional
    public void registrarSolicitudAyudante(Estudiante estudiante, Materia materia) {
        if (estudiante == null || materia == null) {
            return;
        }
        registrarActividad(
                estudiante,
                tituloSolicitudAyudante(materia),
                DESCRIPCION_SOLICITUD_AYUDANTE,
                ActividadEstudiante.EstadoActividad.PENDIENTE
        );
    }

    @Transactional
    public void actualizarEstadoSolicitudAyudante(
            Estudiante estudiante,
            Materia materia,
            ActividadEstudiante.EstadoActividad nuevoEstado
    ) {
        if (estudiante == null || materia == null) {
            return;
        }
        actividadRepository.findFirstByEstudianteIdAndTituloAndEstadoOrderByFechaHoraRegistroDesc(
                        estudiante.getId(),
                        tituloSolicitudAyudante(materia),
                        ActividadEstudiante.EstadoActividad.PENDIENTE
                )
                .ifPresent(actividad -> {
                    actividad.actualizarEstado(nuevoEstado);
                    actividadRepository.save(actividad);
                });
    }

    private void registrarActividad(
            Estudiante estudiante,
            String titulo,
            String descripcion,
            ActividadEstudiante.EstadoActividad estado
    ) {
        actividadRepository.save(new ActividadEstudiante(
                estudiante,
                titulo,
                descripcion,
                fechaActualBolivia(),
                estado
        ));
    }

    private String tituloSolicitudAyudante(Materia materia) {
        return "Solicitar ser ayudante en " + materia.getNombre();
    }

    private LocalDateTime fechaActualBolivia() {
        return LocalDateTime.now(ZONA_HORARIA_BOLIVIA);
    }
}
