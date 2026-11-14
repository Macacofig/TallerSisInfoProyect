package com.unihub.backend.repository;

import com.unihub.backend.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {

    List<Material> findByMateriaIdOrderByTituloAsc(Long idMateria);

    List<Material> findByMateriaIdAndEstadoOrderByTituloAsc(Long idMateria, Material.EstadoMaterial estado);

    List<Material> findByEstadoOrderByTituloAsc(Material.EstadoMaterial estado);
}
