package com.unihub.backend.service;

import com.unihub.backend.common.LogHelper;
import com.unihub.backend.dto.estudiante.EstudianteActualizacionRequest;
import com.unihub.backend.dto.estudiante.EstudianteLoginRequest;
import com.unihub.backend.dto.estudiante.EstudianteLoginResponse;
import com.unihub.backend.dto.estudiante.EstudianteMateriasAprobadasRequest;
import com.unihub.backend.dto.estudiante.EstudianteMateriasAprobadasResponse;
import com.unihub.backend.dto.estudiante.EstudianteRecuperarContrasenaRequest;
import com.unihub.backend.dto.estudiante.EstudianteRequest;
import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.dto.estudiante.EstudianteTelefonoResponse;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.exception.BadRequestException;
import com.unihub.backend.exception.CorreoDuplicadoException;
import com.unihub.backend.exception.CredencialesInvalidasException;
import com.unihub.backend.exception.ResourceNotFoundException;
import com.unihub.backend.mapper.EstudianteMapper;
import com.unihub.backend.repository.EstudianteRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final EstudianteMapper estudianteMapper;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptRateLimiter loginAttemptRateLimiter;

    public EstudianteService(
            EstudianteRepository estudianteRepository,
            EstudianteMapper estudianteMapper,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            LoginAttemptRateLimiter loginAttemptRateLimiter
    ) {
        this.estudianteRepository = estudianteRepository;
        this.estudianteMapper = estudianteMapper;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.loginAttemptRateLimiter = loginAttemptRateLimiter;
    }

    public EstudianteResponse registrar(EstudianteRequest request) {
        if (estudianteRepository.existsByCorreoElectronicoIgnoreCase(request.correoElectronico())) {
            throw new CorreoDuplicadoException(request.correoElectronico());
        }

        Estudiante estudiante = new Estudiante(
                request.nombre(),
                passwordEncoder.encode(request.contrasena()),
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

    public EstudianteTelefonoResponse obtenerTelefono(Long id) {
        Estudiante estudiante = estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado"));
        return new EstudianteTelefonoResponse(estudiante.getTelefono());
    }

    public EstudianteMateriasAprobadasResponse agregarMateriasAprobadas(
            Long id,
            EstudianteMateriasAprobadasRequest request
    ) {
        Estudiante estudiante = estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado"));

        estudiante.agregarMateriasAprobadas(request.materias());
        estudianteRepository.save(estudiante);
        LogHelper.info(EstudianteService.class, "Materias aprobadas del estudiante actualizadas correctamente");
        return new EstudianteMateriasAprobadasResponse(
                estudiante.getId(),
                estudiante.getMateriasAprobadas()
        );
    }

    public EstudianteLoginResponse iniciarSesion(EstudianteLoginRequest request) {
        String correoElectronico = request.correoElectronico();
        String contrasena = request.contrasena();
        loginAttemptRateLimiter.verificarPermitido(correoElectronico);

        Estudiante estudiante = estudianteRepository.findByCorreoElectronicoIgnoreCase(correoElectronico)
                .orElseThrow(() -> {
                    loginAttemptRateLimiter.registrarFallo(correoElectronico);
                    return new CredencialesInvalidasException();
                });

        String contrasenaGuardada = estudiante.getContrasena();
        boolean coincide = false;
        if (contrasenaGuardada != null) {
            try {
                coincide = passwordEncoder.matches(contrasena, contrasenaGuardada);
            } catch (IllegalArgumentException exception) {
                // A malformed or non-BCrypt stored value is treated as invalid credentials.
            }
        }
        if (!coincide) {
            loginAttemptRateLimiter.registrarFallo(correoElectronico);
            throw new CredencialesInvalidasException();
        }

        LogHelper.debug(EstudianteService.class, "Inicio de sesión completado correctamente");
        loginAttemptRateLimiter.registrarExito(correoElectronico);
        return new EstudianteLoginResponse(
            jwtService.generarToken(estudiante),
            jwtService.obtenerDuracionSegundos(),
            estudianteMapper.toResponse(estudiante)
        );
    }

    public EstudianteResponse recuperarContrasena(EstudianteRecuperarContrasenaRequest request) {
        if (!request.nuevaContrasena().equals(request.confirmarNuevaContrasena())) {
            throw new BadRequestException("Las contraseñas no coinciden");
        }

        Estudiante estudiante = estudianteRepository
                .findByCorreoElectronicoIgnoreCase(request.correoElectronico())
                .orElseThrow(() -> new ResourceNotFoundException("El correo electrónico no está registrado"));

        estudiante.actualizarContrasena(passwordEncoder.encode(request.nuevaContrasena()));
        EstudianteResponse response = estudianteMapper.toResponse(estudianteRepository.save(estudiante));
        LogHelper.info(EstudianteService.class, "Contraseña recuperada correctamente");
        return response;
    }

}
