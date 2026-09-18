package com.unihub.backend.repository;

import com.unihub.backend.entity.Docente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocenteRepository extends JpaRepository<Docente, Long> {

	List<Docente> findByMateriaIdOrderByNombreAsc(Long idMateria);
}
