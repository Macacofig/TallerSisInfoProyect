package com.unihub.backend.repository;

import com.unihub.backend.entity.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

public interface MateriaRepository extends 
    JpaRepository<Materia, Long>,
    JpaSpecificationExecutor<Materia> {

    @Query("SELECT DISTINCT m.carrera FROM Materia m WHERE m.carrera IS NOT NULL ORDER BY m.carrera")
    List<String> findCarrerasUnicas();
}