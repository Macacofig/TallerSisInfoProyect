package com.unihub.backend.service;

import com.unihub.backend.dto.estudiante.EstudianteLoginRequest;
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

    public EstudianteResponse actualizar(Long id, EstudianteRequest request) {
        Estudiante estudiante = estudianteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado"));

        if (estudianteRepository.existsByCorreoElectronicoIgnoreCaseAndIdNot(
                request.correoElectronico(), id
        )) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado");
        }

        estudiante.actualizar(
                request.nombre(),
                request.contrasena(),
                request.telefono(),
                request.correoElectronico(),
                request.carrera()
        );
        return estudianteMapper.toResponse(estudianteRepository.save(estudiante));
    }

    public EstudianteResponse iniciarSesion(EstudianteLoginRequest request) {
        String correoElectronico = request.correoElectronico();
        String contrasena = request.contrasena();

        Estudiante estudiante = estudianteRepository.findByCorreoElectronicoIgnoreCase(correoElectronico)
                .orElseThrow(() -> new IllegalArgumentException("Correo electrónico o contraseña incorrectos"));

        if (!estudiante.getContrasena().equals(contrasena)) {
            throw new IllegalArgumentException("Correo electrónico o contraseña incorrectos");
        }

        return estudianteMapper.toResponse(estudiante);
    }
}
