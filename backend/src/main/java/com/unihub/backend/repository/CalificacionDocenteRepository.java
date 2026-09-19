package com.unihub.backend.repository;

import com.unihub.backend.entity.CalificacionDocente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CalificacionDocenteRepository extends JpaRepository<CalificacionDocente, Long> {

	List<CalificacionDocente> findByDocenteId(Long idDocente);

	Optional<CalificacionDocente> findFirstByIdEstudianteAndDocenteId(Long idEstudiante, Long idDocente);

	List<CalificacionDocente> findByGestion(String gestion);

	List<CalificacionDocente> findByGestionBetween(String gestionDesde, String gestionHasta);

	List<CalificacionDocente> findAllByOrderByGestionAsc();
}
