package com.unihub.backend.repository;

import com.unihub.backend.entity.SolicitudMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudMaterialRepository extends JpaRepository<SolicitudMaterial, Long> {

    List<SolicitudMaterial> findByEstudianteId(Long idEstudiante);

    List<SolicitudMaterial> findByEstadoOrderByTituloAsc(SolicitudMaterial.EstadoSolicitudMaterial estado);
}
