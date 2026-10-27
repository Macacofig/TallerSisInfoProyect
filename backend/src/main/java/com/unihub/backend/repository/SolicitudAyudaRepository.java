package com.unihub.backend.repository;

import com.unihub.backend.entity.SolicitudAyuda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudAyudaRepository extends JpaRepository<SolicitudAyuda, Long> {

    List<SolicitudAyuda> findByEstudianteId(Long estudianteId);

    List<SolicitudAyuda> findByAyudanteId(Long ayudanteId);

    List<SolicitudAyuda> findByMateriaId(Long materiaId);

    List<SolicitudAyuda> findByAyudanteIdAndEstado(Long ayudanteId, SolicitudAyuda.EstadoSolicitudAyuda estado);

    List<SolicitudAyuda> findByEstado(SolicitudAyuda.EstadoSolicitudAyuda estado);
}