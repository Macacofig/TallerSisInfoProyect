package com.unihub.backend.repository;

import com.unihub.backend.entity.SolicitudAyudante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudAyudanteRepository extends JpaRepository<SolicitudAyudante, Long> {

    List<SolicitudAyudante> findByEstudianteId(Long estudianteId);

    List<SolicitudAyudante> findByMateriaId(Long materiaId);

    List<SolicitudAyudante> findByEstado(SolicitudAyudante.EstadoSolicitud estado);

    boolean existsByEstudianteIdAndMateriaIdAndEstadoIn(Long estudianteId, Long materiaId, List<SolicitudAyudante.EstadoSolicitud> estados);
}