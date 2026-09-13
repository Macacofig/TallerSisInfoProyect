package com.unihub.backend.repository;

import com.unihub.backend.entity.CalificacionMateria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CalificacionMateriaRepository extends JpaRepository<CalificacionMateria, Long> {

	List<CalificacionMateria> findByMateriaId(Long idMateria);

	Optional<CalificacionMateria> findFirstByIdEstudianteAndMateriaId(Long idEstudiante, Long idMateria);

	List<CalificacionMateria> findByGestion(String gestion);

	List<CalificacionMateria> findByGestionBetween(String gestionDesde, String gestionHasta);

	List<CalificacionMateria> findAllByOrderByGestionAsc();
}
