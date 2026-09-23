package com.unihub.backend.service;

import com.unihub.backend.dto.docente.DocenteRequest;
import com.unihub.backend.dto.docente.DocenteResponse;
import com.unihub.backend.entity.Docente;
import com.unihub.backend.mapper.DocenteMapper;
import com.unihub.backend.repository.DocenteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocenteService {

    private final DocenteRepository docenteRepository;
    private final DocenteMapper docenteMapper;

    public DocenteService(
            DocenteRepository docenteRepository,
            DocenteMapper docenteMapper
    ) {
        this.docenteRepository = docenteRepository;
        this.docenteMapper = docenteMapper;
    }

    public DocenteResponse agregar(DocenteRequest request) {
        Docente docente = new Docente(request.nombre().trim());
        return docenteMapper.toResponse(docenteRepository.save(docente));
    }

    public List<DocenteResponse> obtenerPorMateria(Long idMateria) {
        return docenteRepository.findByMateriaIdOrderByNombreAsc(idMateria)
                .stream()
                .map(docenteMapper::toResponse)
                .toList();
    }
}