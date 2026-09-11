package com.unihub.backend.repository;

import com.unihub.backend.entity.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MateriaRepository extends 
    JpaRepository<Materia, Long>,
    JpaSpecificationExecutor<Materia> {
}