package com.unihub.backend.repository;

import com.unihub.backend.entity.SolicitudAyudante;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SolicitudAyudanteRepository extends JpaRepository<SolicitudAyudante, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SolicitudAyudante s WHERE s.id = :id")
    Optional<SolicitudAyudante> findByIdForUpdate(@Param("id") Long id);

    List<SolicitudAyudante> findByEstudianteId(Long estudianteId);

    List<SolicitudAyudante> findByMateriaId(Long materiaId);

    List<SolicitudAyudante> findByEstado(SolicitudAyudante.EstadoSolicitud estado);

    @Query("SELECT s.id FROM SolicitudAyudante s WHERE s.ayudanteMateria.id = :ayudanteMateriaId ORDER BY s.id DESC")
    List<Long> findIdsByAyudanteMateriaId(@Param("ayudanteMateriaId") Long ayudanteMateriaId);

    boolean existsByEstudianteIdAndMateriaIdAndEstadoIn(Long estudianteId, Long materiaId, List<SolicitudAyudante.EstadoSolicitud> estados);
}
