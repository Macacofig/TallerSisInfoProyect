package com.unihub.backend.service;

import com.unihub.backend.dto.estudiante.EstudianteRequest;
import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.mapper.EstudianteMapper;
import com.unihub.backend.repository.EstudianteRepository;
import org.springframework.stereotype.Service;

@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final EstudianteMapper estudianteMapper;

    public EstudianteService(
            EstudianteRepository estudianteRepository,
            EstudianteMapper estudianteMapper
    ) {
        this.estudianteRepository = estudianteRepository;
        this.estudianteMapper = estudianteMapper;
    }

    public EstudianteResponse registrar(EstudianteRequest request) {
        if (estudianteRepository.existsByCorreoElectronicoIgnoreCase(request.correoElectronico())) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado");
        }

        Estudiante estudiante = new Estudiante(
                request.nombre(),
                request.contrasena(),
                request.telefono(),
                request.correoElectronico(),
                request.carrera()
        );
        return estudianteMapper.toResponse(estudianteRepository.save(estudiante));
    }
}
