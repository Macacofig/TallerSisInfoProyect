package com.unihub.backend.service;

import com.unihub.backend.dto.materia.MateriaResponse;
import com.unihub.backend.mapper.MateriaMapper;
import com.unihub.backend.repository.MateriaRepository;
import org.springframework.stereotype.Service;
import com.unihub.backend.entity.Materia;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import com.unihub.backend.specification.MateriaSpecification;

@Service
public class MateriaService {

    private final MateriaRepository materiaRepository;
    private final MateriaMapper materiaMapper;

    public MateriaService(
            MateriaRepository materiaRepository,
            MateriaMapper materiaMapper
    ) {
        this.materiaRepository = materiaRepository;
        this.materiaMapper = materiaMapper;
    }

    public List<MateriaResponse> obtenerMaterias(
            String nombre,
            String carrera,
            Integer semestre
    ) {

        Specification<Materia> specification =
        MateriaSpecification.conFiltros(
                nombre,
                carrera,
                semestre
        );

        return materiaRepository.findAll(specification)
                .stream()
                .map(materiaMapper::toResponse)
                .toList();
    }
}