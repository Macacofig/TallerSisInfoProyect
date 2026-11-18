package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.material.SolicitudMaterialResponse;
import com.unihub.backend.entity.Material;
import com.unihub.backend.entity.SolicitudMaterial;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.MaterialMapper;
import com.unihub.backend.repository.MaterialRepository;
import com.unihub.backend.repository.SolicitudMaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SolicitudMaterialService {

    private final SolicitudMaterialRepository solicitudMaterialRepository;
    private final MaterialRepository materialRepository;
    private final MaterialMapper materialMapper;

    public SolicitudMaterialService(
            SolicitudMaterialRepository solicitudMaterialRepository,
            MaterialRepository materialRepository,
            MaterialMapper materialMapper
    ) {
        this.solicitudMaterialRepository = solicitudMaterialRepository;
        this.materialRepository = materialRepository;
        this.materialMapper = materialMapper;
    }

    public List<SolicitudMaterialResponse> obtenerTodas() {
        return solicitudMaterialRepository.findAll().stream()
                .map(materialMapper::toSolicitudResponse)
                .toList();
    }

    public List<SolicitudMaterialResponse> obtenerPendientes() {
        return solicitudMaterialRepository.findByEstadoOrderByTituloAsc(
                SolicitudMaterial.EstadoSolicitudMaterial.PENDIENTE
        ).stream()
                .map(materialMapper::toSolicitudResponse)
                .toList();
    }

    @Transactional
    public SolicitudMaterialResponse aprobar(Long idSolicitud) {
        SolicitudMaterial solicitud = solicitudMaterialRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("La solicitud de material no existe"));
        Material material = solicitud.getMaterial();

        exigirPendiente(solicitud, material);

        solicitud.aprobar();
        material.activar();
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
        material.rechazar();
        solicitudMaterialRepository.save(solicitud);
        materialRepository.save(material);

        LogHelper.info(SolicitudMaterialService.class,
                "Solicitud de material " + idSolicitud + " rechazada");
        return materialMapper.toSolicitudResponse(solicitud);
    }

    private void exigirPendiente(SolicitudMaterial solicitud, Material material) {
        if (solicitud.getEstado() != SolicitudMaterial.EstadoSolicitudMaterial.PENDIENTE) {
            throw new IllegalStateException("Solo se puede decidir una solicitud de material pendiente");
        }
        if (material.getEstado() != Material.EstadoMaterial.PENDIENTE) {
            throw new IllegalStateException("El material asociado ya fue decidido");
        }
    }
}
