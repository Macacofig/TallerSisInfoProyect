package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.material.SolicitudMaterialResponse;
import com.unihub.backend.entity.ActividadEstudiante;
import com.unihub.backend.entity.Material;
import com.unihub.backend.entity.SolicitudMaterial;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.MaterialMapper;
import com.unihub.backend.repository.ActividadEstudianteRepository;
import com.unihub.backend.repository.MaterialRepository;
import com.unihub.backend.repository.SolicitudMaterialRepository;
import com.unihub.backend.service.almacenamiento.AlmacenamientoArchivos;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SolicitudMaterialService {

    private final SolicitudMaterialRepository solicitudMaterialRepository;
    private final MaterialRepository materialRepository;
    private final MaterialMapper materialMapper;
    private final ActividadEstudianteRepository actividadRepository;
    private final AlmacenamientoArchivos almacenamiento;

    public SolicitudMaterialService(
            SolicitudMaterialRepository solicitudMaterialRepository,
            MaterialRepository materialRepository,
            MaterialMapper materialMapper,
            ActividadEstudianteRepository actividadRepository,
            AlmacenamientoArchivos almacenamiento
    ) {
        this.solicitudMaterialRepository = solicitudMaterialRepository;
        this.materialRepository = materialRepository;
        this.materialMapper = materialMapper;
        this.actividadRepository = actividadRepository;
        this.almacenamiento = almacenamiento;
    }

    public List<SolicitudMaterialResponse> obtenerTodas() {
        return solicitudMaterialRepository.findAll().stream()
                .map(this::mapearSolicitudConMaterial)
                .toList();
    }

    public List<SolicitudMaterialResponse> obtenerPendientes() {
        return solicitudMaterialRepository.findByEstadoOrderByTituloAsc(
                SolicitudMaterial.EstadoSolicitudMaterial.PENDIENTE
        ).stream()
                .map(this::mapearSolicitudConMaterial)
                .toList();
    }

    private SolicitudMaterialResponse mapearSolicitudConMaterial(SolicitudMaterial solicitud) {
        Material material = solicitud.getMaterial();
        if (material != null && material.getId() != null) {
            material = materialRepository.findById(material.getId()).orElse(material);
        }

        return materialMapper.toSolicitudResponse(solicitud, material);
    }

    @Transactional
    public SolicitudMaterialResponse aprobar(Long idSolicitud) {
        SolicitudMaterial solicitud = solicitudMaterialRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("La solicitud de material no existe"));
        Material material = solicitud.getMaterial();

        exigirPendiente(solicitud, material);

        solicitud.aprobar();
        material.activar();
        actividadRepository.findFirstByEstudianteIdAndIdMaterialAndEstadoOrderByFechaHoraRegistroDesc(
                        solicitud.getEstudiante().getId(),
                        material.getId(),
                        ActividadEstudiante.EstadoActividad.PENDIENTE
                )
                .ifPresent(actividad -> {
                    actividad.actualizarEstado(ActividadEstudiante.EstadoActividad.APROBADA);
                    actividadRepository.save(actividad);
                });
        solicitudMaterialRepository.save(solicitud);
        materialRepository.save(material);

        LogHelper.info(SolicitudMaterialService.class,
                "Solicitud de material " + idSolicitud + " aprobada");
        return materialMapper.toSolicitudResponse(solicitud);
    }

    @Transactional
    public SolicitudMaterialResponse rechazar(Long idSolicitud) {
        SolicitudMaterial solicitud = solicitudMaterialRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("La solicitud de material no existe"));
        Material material = solicitud.getMaterial();

        exigirPendiente(solicitud, material);

        solicitud.negar();
        SolicitudMaterialResponse respuesta = materialMapper.toSolicitudResponse(solicitud);

        eliminarArchivoYActualizarActividad(solicitud, material);

        solicitud.desvincularMaterial();
        solicitudMaterialRepository.save(solicitud);
        materialRepository.delete(material);

        LogHelper.info(SolicitudMaterialService.class,
                "Solicitud de material " + idSolicitud + " rechazada");
        return respuesta;
    }

    @Transactional
    public void eliminar(Long idSolicitud) {
        SolicitudMaterial solicitud = solicitudMaterialRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("La solicitud de material no existe"));
        Material material = solicitud.getMaterial();

        exigirPendiente(solicitud, material);
        eliminarArchivoYActualizarActividad(solicitud, material);

        solicitud.desvincularMaterial();
        solicitudMaterialRepository.delete(solicitud);
        materialRepository.delete(material);

        LogHelper.info(SolicitudMaterialService.class,
                "Solicitud de material " + idSolicitud + " eliminada");
    }

    private void eliminarArchivoYActualizarActividad(SolicitudMaterial solicitud, Material material) {
        String linkMaterial = material.getLinkMaterial();
        if (linkMaterial == null || linkMaterial.isBlank()) {
            LogHelper.warn(SolicitudMaterialService.class,
                    "No se pudo eliminar el archivo de la solicitud " + solicitud.getId()
                            + ": el material no tiene un link válido");
        } else {
            almacenamiento.eliminar(extraerRuta(linkMaterial));
        }

        actividadRepository.findFirstByEstudianteIdAndIdMaterialAndEstadoOrderByFechaHoraRegistroDesc(
                        solicitud.getEstudiante().getId(),
                        material.getId(),
                        ActividadEstudiante.EstadoActividad.PENDIENTE
                )
                .ifPresent(actividad -> {
                    actividad.actualizarEstado(ActividadEstudiante.EstadoActividad.RECHAZADA);
                    actividadRepository.save(actividad);
                });
    }

    private String extraerRuta(String link) {
        String marcador = "/storage/v1/object/public/";
        if (link == null) {
            throw new IllegalStateException("El material no tiene una URL de descarga válida");
        }
        int inicio = link.indexOf(marcador);
        if (inicio < 0) {
            throw new IllegalStateException("El material no tiene una URL de descarga válida");
        }
        String resto = link.substring(inicio + marcador.length()).split("[?#]", 2)[0];
        int barra = resto.indexOf('/');
        if (barra < 0 || barra == resto.length() - 1) {
            throw new IllegalStateException("El material no tiene una URL de descarga válida");
        }
        return resto.substring(barra + 1);
    }

    private void exigirPendiente(SolicitudMaterial solicitud, Material material) {
        if (solicitud.getEstado() != SolicitudMaterial.EstadoSolicitudMaterial.PENDIENTE) {
            throw new IllegalStateException("Solo se puede decidir una solicitud de material pendiente");
        }
        if (material == null) {
            throw new ResourceNotFoundException("El material asociado a la solicitud no existe");
        }
        if (material.getEstado() != Material.EstadoMaterial.PENDIENTE) {
            throw new IllegalStateException("El material asociado ya fue decidido");
        }
    }
}
