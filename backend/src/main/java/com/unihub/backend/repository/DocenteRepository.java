package com.unihub.backend.repository;

import com.unihub.backend.entity.Docente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DocenteRepository extends JpaRepository<Docente, Long> {

	@Query("select d from Docente d join d.materias dm where dm.materia.id = :idMateria order by d.nombre")
	List<Docente> findByMateriaIdOrderByNombreAsc(Long idMateria);
}
