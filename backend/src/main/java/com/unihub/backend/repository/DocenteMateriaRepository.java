package com.unihub.backend.repository;

import com.unihub.backend.entity.DocenteMateria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocenteMateriaRepository extends JpaRepository<DocenteMateria, Long> {
    boolean existsByDocenteIdAndMateriaId(Long idDocente, Long idMateria);
}