package com.unihub.backend.service;

import com.unihub.backend.dto.materia.MateriaResponse;
import com.unihub.backend.mapper.MateriaMapper;
import com.unihub.backend.repository.MateriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public List<MateriaResponse> obtenerMaterias() {

        return materiaRepository.findAll()
                .stream()
                .map(materiaMapper::toResponse)
                .toList();
    }
}