package com.unihub.backend.repository;

import com.unihub.backend.entity.AyudanteMateria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AyudanteMateriaRepository extends JpaRepository<AyudanteMateria, Long> {

    List<AyudanteMateria> findByMateriaIdAndEstado(Long materiaId, AyudanteMateria.EstadoAyudante estado);

    List<AyudanteMateria> findByEstudianteId(Long estudianteId);

    @Query("SELECT am FROM AyudanteMateria am WHERE am.estudiante.id = :estudianteId AND am.materia.id = :materiaId AND am.estado = :estado")
    AyudanteMateria findByEstudianteIdAndMateriaIdAndEstado(Long estudianteId, Long materiaId, AyudanteMateria.EstadoAyudante estado);

    boolean existsByEstudianteIdAndMateriaIdAndEstadoIn(Long estudianteId, Long materiaId, List<AyudanteMateria.EstadoAyudante> estados);

    List<AyudanteMateria> findByEstado(AyudanteMateria.EstadoAyudante estado);
}