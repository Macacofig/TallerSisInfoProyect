package com.unihub.backend.repository;

import com.unihub.backend.entity.Notificacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    Page<Notificacion> findByEstudianteIdOrderByFechaCreacionDescIdDesc(Long estudianteId, Pageable pageable);
    long countByEstudianteIdAndLeidaFalse(Long estudianteId);
    Optional<Notificacion> findByIdAndEstudianteId(Long id, Long estudianteId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Notificacion n set n.leida = true where n.estudiante.id = :estudianteId and n.leida = false")
    int marcarTodasComoLeidas(@Param("estudianteId") Long estudianteId);
}
