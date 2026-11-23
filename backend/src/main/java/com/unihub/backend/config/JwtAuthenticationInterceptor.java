package com.unihub.backend.config;

import com.unihub.backend.service.JwtService;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.repository.EstudianteRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Optional;

@Component
@ConditionalOnProperty(name = "app.security.jwt-middleware.enabled", havingValue = "true")
public class JwtAuthenticationInterceptor implements HandlerInterceptor {

    public static final String STUDENT_ID_ATTRIBUTE = "authenticatedStudentId";

    private final JwtService jwtService;
    private final EstudianteRepository estudianteRepository;

    public JwtAuthenticationInterceptor(JwtService jwtService, EstudianteRepository estudianteRepository) {
        this.jwtService = jwtService;
        this.estudianteRepository = estudianteRepository;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) throws IOException {

        // Permite las comprobaciones previas de CORS sin exigir JWT.
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }

        if (esPublica(request)) {
            return true;
        }

        String authorization = request.getHeader("Authorization");

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return rechazar(response);
        }

        Optional<Long> studentId =
                jwtService.obtenerIdEstudiante(authorization.substring(7));

        if (studentId.isEmpty()) {
            return rechazar(response);
        }

        request.setAttribute(STUDENT_ID_ATTRIBUTE, studentId.get());
        if (requiereAdministrador(request) && estudianteRepository.findByIdAndRol(studentId.get(), Estudiante.Rol.ADMIN).isEmpty()) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Se requiere rol de administrador");
            return false;
        }
        return true;
    }

    private boolean requiereAdministrador(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        return (HttpMethod.POST.matches(method) && path.equals("/api/ayudante-materia"))
                || (HttpMethod.POST.matches(method) && path.matches("/api/solicitud-ayudante/\\d+/(aprobar|rechazar)"))
                || (HttpMethod.GET.matches(method) && path.equals("/api/ayudante-materia/pendientes"))
                || (HttpMethod.POST.matches(method) && path.matches("/api/ayudante-materia/\\d+/(aprobar|rechazar)"))
                || (HttpMethod.GET.matches(method) && (path.equals("/api/solicitud-material")
                    || path.equals("/api/solicitud-material/pendientes")))
                || (HttpMethod.POST.matches(method)
                    && path.matches("/api/solicitud-material/\\d+/(aprobar|rechazar)"))
                || (HttpMethod.DELETE.matches(method) && path.matches("/api/solicitud-material/\\d+"));
    }

    private boolean esPublica(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path.equals("/api/notificaciones") || path.startsWith("/api/notificaciones/")) {
            return false;
        }

        // HU-14 y HU-36: listar materiales aprobados, consultar solicitudes de
        // ayudante y consultar la actividad de un estudiante son operaciones públicas.
        if ("/api/material/aprobados".equals(path)) {
            return true;
        }
        if (HttpMethod.GET.matches(method)
                && ("/api/solicitud-ayudante".equals(path)
                    || "/api/solicitud-ayudante/pendientes".equals(path))) {
            return true;
        }

        // HU-51: la gestión de materias aprobadas no requiere JWT.
        if (path.matches("/api/estudiantes/\\d+/materias-aprobadas(/.*)?")) {
            return true;
        }

        if ("/api/test".equals(path) || "/api/health/database".equals(path)
                || (HttpMethod.POST.matches(method)
                    && ("/api/estudiantes".equals(path) || "/api/estudiantes/login".equals(path)
                        || "/api/estudiantes/recuperar-contrasena".equals(path)
                        || path.startsWith("/api/horarios/")
                        || "/api/material/subir".equals(path)
                        || "/api/docentes".equals(path) || "/api/docente-materia".equals(path)))) {
            return true;
        }

        if (HttpMethod.GET.matches(method)) {
            return !path.matches("/api/estudiantes/\\d+")
                    && !path.matches("/api/estudiantes/\\d+/telefono")
                    && !path.matches("/api/calificacion-(materia|docente)/estudiante/.*")
                    && !path.startsWith("/api/solicitud-material")
                    && !path.startsWith("/api/solicitud-ayudante")
                    && !path.equals("/api/ayudante-materia/pendientes");
        }
        return false;
    }

    private boolean rechazar(HttpServletResponse response) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Se requiere una sesión válida");
        return false;
    }
}
