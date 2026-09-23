package com.unihub.backend.repository;

import com.unihub.backend.entity.CalificacionDocente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CalificacionDocenteRepository extends JpaRepository<CalificacionDocente, Long> {

	List<CalificacionDocente> findByMateriaId(Long idMateria);

	Optional<CalificacionDocente> findFirstByIdEstudianteAndDocenteIdAndMateriaId(Long idEstudiante, Long idDocente, Long idMateria);

	List<CalificacionDocente> findByMateriaIdAndGestion(Long idMateria, String gestion);

	List<CalificacionDocente> findByMateriaIdAndGestionBetween(Long idMateria, String gestionDesde, String gestionHasta);
	List<CalificacionDocente> findByMateriaIdOrderByGestionAsc(Long idMateria);
}
