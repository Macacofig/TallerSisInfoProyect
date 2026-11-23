package com.unihub.backend.repository;

import com.unihub.backend.entity.Estudiante;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

    boolean existsByCorreoElectronicoIgnoreCase(String correoElectronico);

    boolean existsByCorreoElectronicoIgnoreCaseAndIdNot(String correoElectronico, Long id);

    Optional<Estudiante> findByCorreoElectronicoIgnoreCase(String correoElectronico);
    Optional<Estudiante> findByIdAndRol(Long id, Estudiante.Rol rol);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Estudiante e WHERE e.id = :id")
    Optional<Estudiante> findByIdForUpdate(@Param("id") Long id);
}
