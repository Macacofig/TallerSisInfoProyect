package com.unihub.backend.service;

import com.unihub.backend.dto.docente.DocenteMateriaRequest;
import com.unihub.backend.dto.docente.DocenteMateriaResponse;
import com.unihub.backend.entity.DocenteMateria;
import com.unihub.backend.repository.DocenteMateriaRepository;
import com.unihub.backend.repository.DocenteRepository;
import com.unihub.backend.repository.MateriaRepository;
import org.springframework.stereotype.Service;

@Service
public class DocenteMateriaService {

    private final DocenteMateriaRepository docenteMateriaRepository;
    private final DocenteRepository docenteRepository;
    private final MateriaRepository materiaRepository;

    public DocenteMateriaService(
            DocenteMateriaRepository docenteMateriaRepository,
            DocenteRepository docenteRepository,
            MateriaRepository materiaRepository
    ) {
        this.docenteMateriaRepository = docenteMateriaRepository;
        this.docenteRepository = docenteRepository;
        this.materiaRepository = materiaRepository;
    }

    public DocenteMateriaResponse crear(DocenteMateriaRequest request) {
        var docente = docenteRepository.findById(request.idDocente())
                .orElseThrow(() -> new IllegalArgumentException("El docente no existe"));
        var materia = materiaRepository.findById(request.idMateria())
                .orElseThrow(() -> new IllegalArgumentException("La materia no existe"));

        if (docenteMateriaRepository.existsByDocenteIdAndMateriaId(request.idDocente(), request.idMateria())) {
            throw new IllegalArgumentException("El docente ya esta relacionado con la materia");
        }

        DocenteMateria relacion = docenteMateriaRepository.save(new DocenteMateria(docente, materia));
        return new DocenteMateriaResponse(relacion.getId(), docente.getId(), materia.getId());
    }
}