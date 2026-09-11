package com.unihub.backend.specification;

import com.unihub.backend.entity.Materia;

import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public class MateriaSpecification {

    public static Specification<Materia> conFiltros(
            String nombre,
            String carrera,
            Integer semestre
    ) {

        return (root, query, criteriaBuilder) -> {

            var predicate = criteriaBuilder.conjunction();

            if (nombre != null && !nombre.isBlank()) {

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("nombre")),
                                "%" + nombre.toLowerCase(Locale.ROOT) + "%"
                        )
                );
            }

            if (carrera != null && !carrera.isBlank()) {

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(root.get("carrera")),
                                carrera.toLowerCase()
                        )
                );
            }

            if (semestre != null) {

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(
                                root.get("semestre"),
                                semestre
                        )
                );
            }

            return predicate;
        };
    }
}