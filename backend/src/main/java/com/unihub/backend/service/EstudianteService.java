package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.estudiante.EstudianteActualizacionRequest;
import com.unihub.backend.dto.estudiante.EstudianteLoginRequest;
import com.unihub.backend.dto.estudiante.EstudianteLoginResponse;
import com.unihub.backend.dto.estudiante.EstudianteRequest;
import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.exception.BadRequestException;
import com.unihub.backend.exception.CorreoDuplicadoException;
import com.unihub.backend.exception.CredencialesInvalidasException;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.EstudianteMapper;
import com.unihub.backend.repository.EstudianteRepository;
import org.springframework.stereotype.Service;

@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final EstudianteMapper estudianteMapper;
    private final JwtService jwtService;

    public EstudianteService(
            EstudianteRepository estudianteRepository,
            EstudianteMapper estudianteMapper,
            JwtService jwtService
    ) {
        this.estudianteRepository = estudianteRepository;
        this.estudianteMapper = estudianteMapper;
        this.jwtService = jwtService;
    }

    public EstudianteResponse registrar(EstudianteRequest request) {
        if (estudianteRepository.existsByCorreoElectronicoIgnoreCase(request.correoElectronico())) {
            throw new CorreoDuplicadoException(request.correoElectronico());
        }

        Estudiante estudiante = new Estudiante(
                request.nombre(),
                request.contrasena(),
                request.telefono(),
                request.correoElectronico(),
                request.carrera()
        );
        EstudianteResponse response = estudianteMapper.toResponse(estudianteRepository.save(estudiante));
        LogHelper.info(EstudianteService.class, "Estudiante registrado correctamente");
        return response;
    }

    public EstudianteResponse actualizar(Long id, EstudianteActualizacionRequest request) {
        Estudiante estudiante = estudianteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado"));

        estudiante.actualizar(
                request.nombre(),
                request.telefono(),
                request.carrera()
        );
        EstudianteResponse response = estudianteMapper.toResponse(estudianteRepository.save(estudiante));
        LogHelper.info(EstudianteService.class, "Estudiante actualizado correctamente");
        return response;
    }

    public EstudianteLoginResponse iniciarSesion(EstudianteLoginRequest request) {
        String correoElectronico = request.correoElectronico();
        String contrasena = request.contrasena();

        Estudiante estudiante = estudianteRepository.findByCorreoElectronicoIgnoreCase(correoElectronico)
                .orElseThrow(CredencialesInvalidasException::new);

        if (!estudiante.getContrasena().equals(contrasena)) {
            throw new CredencialesInvalidasException();
        }

        LogHelper.debug(EstudianteService.class, "Inicio de sesión completado correctamente");
        return new EstudianteLoginResponse(
            jwtService.generarToken(estudiante),
            jwtService.obtenerDuracionSegundos(),
            estudianteMapper.toResponse(estudiante)
        );
    }
}
