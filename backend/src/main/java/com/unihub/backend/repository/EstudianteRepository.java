package com.unihub.backend.repository;

import com.unihub.backend.entity.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

    boolean existsByCorreoElectronicoIgnoreCase(String correoElectronico);
}
