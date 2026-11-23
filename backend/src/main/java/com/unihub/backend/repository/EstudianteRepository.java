package com.unihub.backend.repository;

import com.unihub.backend.entity.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

    boolean existsByCorreoElectronicoIgnoreCase(String correoElectronico);

    boolean existsByCorreoElectronicoIgnoreCaseAndIdNot(String correoElectronico, Long id);

    Optional<Estudiante> findByCorreoElectronicoIgnoreCase(String correoElectronico);
    Optional<Estudiante> findByIdAndRol(Long id, Estudiante.Rol rol);

    @Modifying
    @Query(value = """
            UPDATE estudiantes
            SET materias_aprobadas = ARRAY(
                SELECT DISTINCT materia FROM unnest(materias_aprobadas || CAST(:materias AS text[])) AS materia
            )
            WHERE id = :id
            """, nativeQuery = true)
    int reemplazarMateriasAprobadas(@Param("id") Long id, @Param("materias") String[] materias);

    @Modifying
    @Query(value = """
            UPDATE estudiantes
            SET materias_aprobadas = array_remove(materias_aprobadas, :materia)
            WHERE id = :id
            """, nativeQuery = true)
    int eliminarMateriaAprobada(@Param("id") Long id, @Param("materia") String materia);
}
