package com.unihub.backend.mapper;

import com.unihub.backend.dto.material.MaterialResponse;
import com.unihub.backend.dto.material.SolicitudMaterialResponse;
import com.unihub.backend.entity.Material;
import com.unihub.backend.entity.SolicitudMaterial;
import org.springframework.stereotype.Component;

@Component
public class MaterialMapper {

    public MaterialResponse toResponse(Material material) {
        return new MaterialResponse(
                material.getId(),
                material.getLinkMaterial(),
                material.getTitulo(),
                material.getDescripcion(),
                material.getTipo().name(),
                material.getMateria().getId(),
                material.getMateria().getNombre(),
                material.getDocente().getId(),
                material.getDocente().getNombre(),
                material.getSemestreIngresado(),
                material.getEstado().name()
        );
    }

    public SolicitudMaterialResponse toSolicitudResponse(SolicitudMaterial solicitud) {
        return toSolicitudResponse(solicitud, solicitud.getMaterial());
    }

    public SolicitudMaterialResponse toSolicitudResponse(
            SolicitudMaterial solicitud,
            Material material
    ) {
        return new SolicitudMaterialResponse(
                solicitud.getId(),
                solicitud.getTitulo(),
                material == null || material.getMateria() == null ? null : material.getMateria().getNombre(),
                material == null || material.getDocente() == null ? null : material.getDocente().getNombre(),
                solicitud.getEstudiante() == null ? null : solicitud.getEstudiante().getNombre(),
                material == null || material.getTipo() == null ? null : material.getTipo().name(),
                solicitud.getEstudiante().getId(),
                material == null ? null : material.getId(),
                material == null ? null : material.getLinkMaterial(),
                solicitud.getEstado().name()
        );
    }
}
