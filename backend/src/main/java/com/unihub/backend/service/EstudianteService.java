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

import java.util.List;

@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final EstudianteMapper estudianteMapper;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptRateLimiter loginAttemptRateLimiter;
    private final MateriaService materiaService;

    public EstudianteService(
            EstudianteRepository estudianteRepository,
            EstudianteMapper estudianteMapper,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            LoginAttemptRateLimiter loginAttemptRateLimiter,
            MateriaService materiaService
    ) {
        this.estudianteRepository = estudianteRepository;
        this.estudianteMapper = estudianteMapper;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.loginAttemptRateLimiter = loginAttemptRateLimiter;
        this.materiaService = materiaService;
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

    public EstudianteMateriasAprobadasResponse actualizarMateriasAprobadas(
            Long id,
            EstudianteMateriasAprobadasRequest request
    ) {
        Estudiante estudiante = validarEstudiante(id);
        List<String> materias = List.copyOf(request.materias());
        estudianteRepository.reemplazarMateriasAprobadas(id, materias.toArray(String[]::new));
        LogHelper.info(EstudianteService.class, "Materias aprobadas del estudiante actualizadas correctamente");
        return construirRespuesta(estudiante, materias);
    }

    public EstudianteMateriasAprobadasResponse obtenerMateriasAprobadas(Long id, String carrera) {
        Estudiante estudiante = validarEstudiante(id);
        String carreraConsulta = carrera != null && !carrera.isBlank() ? carrera.trim() : estudiante.getCarrera();
        return construirRespuesta(estudiante, carreraConsulta, listarAprobadas(estudiante));
    }

    public EstudianteMateriasAprobadasResponse eliminarMateriaAprobada(Long id, String materia) {
        if (materia == null || materia.isBlank()) {
            throw new BadRequestException("La materia es obligatoria");
        }
        Estudiante estudiante = validarEstudiante(id);
        String materiaEliminar = materia.trim();
        estudianteRepository.eliminarMateriaAprobada(id, materiaEliminar);
        LogHelper.info(EstudianteService.class, "Materia aprobada eliminada correctamente");

        List<String> aprobadas = listarAprobadas(estudiante).stream()
                .filter(materiaActual -> !materiaActual.equalsIgnoreCase(materiaEliminar))
                .toList();
        return construirRespuesta(estudiante, aprobadas);
    }

    private Estudiante validarEstudiante(Long id) {
        return estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado"));
    }

    private List<String> listarAprobadas(Estudiante estudiante) {
        return estudiante.getMateriasAprobadas() == null
                ? List.of()
                : List.copyOf(estudiante.getMateriasAprobadas());
    }

    private EstudianteMateriasAprobadasResponse construirRespuesta(
            Estudiante estudiante,
            List<String> materiasAprobadas
    ) {
        return construirRespuesta(estudiante, estudiante.getCarrera(), materiasAprobadas);
    }

    private EstudianteMateriasAprobadasResponse construirRespuesta(
            Estudiante estudiante,
            String carrera,
            List<String> materiasAprobadas
    ) {
        return new EstudianteMateriasAprobadasResponse(
                estudiante.getId(),
                carrera,
                materiasAprobadas,
                materiaService.obtenerMaterias(null, carrera, null)
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
