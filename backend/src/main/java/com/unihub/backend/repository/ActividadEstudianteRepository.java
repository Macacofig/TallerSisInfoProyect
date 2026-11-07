package com.unihub.backend.repository;

import com.unihub.backend.entity.ActividadEstudiante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ActividadEstudianteRepository extends JpaRepository<ActividadEstudiante, Long> {

    List<ActividadEstudiante> findByEstudianteIdOrderByFechaHoraRegistroDesc(Long idEstudiante);

    Optional<ActividadEstudiante> findFirstByEstudianteIdAndTituloAndEstadoOrderByFechaHoraRegistroDesc(
            Long idEstudiante,
            String titulo,
            ActividadEstudiante.EstadoActividad estado
    );
}
