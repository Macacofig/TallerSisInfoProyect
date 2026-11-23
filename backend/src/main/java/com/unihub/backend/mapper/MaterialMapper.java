package com.unihub.backend.mapper;

import com.unihub.backend.dto.material.MaterialResponse;
import com.unihub.backend.dto.material.MaterialEstudianteResponse;
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
        Material material = solicitud.getMaterial();
        return new SolicitudMaterialResponse(
                solicitud.getId(),
                solicitud.getTitulo(),
                solicitud.getEstudiante().getId(),
                solicitud.getEstudiante().getNombre(),
                material == null ? null : material.getId(),
                material == null ? null : material.getLinkMaterial(),
                solicitud.getEstado().name()
        );
    }

    public MaterialEstudianteResponse toMaterialEstudianteResponse(SolicitudMaterial solicitud) {
        Material material = solicitud.getMaterial();
        return new MaterialEstudianteResponse(
                solicitud.getId(),
                solicitud.getTitulo(),
                material == null ? null : material.getMateria().getNombre(),
                material == null ? null : material.getTipo().name(),
                solicitud.getEstado().name()
        );
    }
}
