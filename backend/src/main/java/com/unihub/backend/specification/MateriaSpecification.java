package com.unihub.backend.specification;

import com.unihub.backend.entity.Materia;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public class MateriaSpecification {

    private static final String LETRAS_TILDADAS = "áéíóúü";
    private static final String LETRAS_NORMALIZADAS = "aeiouu";

    private static Expression<String> normalizar(
            CriteriaBuilder criteriaBuilder,
            Expression<String> expresion
    ) {
        return criteriaBuilder.function(
                "translate",
                String.class,
                criteriaBuilder.lower(expresion),
                criteriaBuilder.literal(LETRAS_TILDADAS),
                criteriaBuilder.literal(LETRAS_NORMALIZADAS)
        );
    }

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
                                normalizar(criteriaBuilder, root.get("nombre")),
                                "%" + normalizarTexto(nombre) + "%"
                        )
                );
            }

            if (carrera != null && !carrera.isBlank()) {

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(
                                normalizar(criteriaBuilder, root.get("carrera")),
                                normalizarTexto(carrera)
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

        private static String normalizarTexto(String texto) {
                return texto.toLowerCase(Locale.ROOT)
                                .replace('á', 'a')
                                .replace('é', 'e')
                                .replace('í', 'i')
                                .replace('ó', 'o')
                                .replace('ú', 'u')
                                .replace('ü', 'u');
        }
}