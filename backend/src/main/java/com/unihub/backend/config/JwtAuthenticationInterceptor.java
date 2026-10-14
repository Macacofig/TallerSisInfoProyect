package com.unihub.backend.config;

import com.unihub.backend.service.JwtService;
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

    public JwtAuthenticationInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
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
        return true;
    }

    private boolean esPublica(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("/api/test".equals(path)
                || (HttpMethod.POST.matches(method)
                    && ("/api/estudiantes".equals(path) || "/api/estudiantes/login".equals(path)
                        || path.startsWith("/api/horarios/")
                        || "/api/docentes".equals(path) || "/api/docente-materia".equals(path)))) {
            return true;
        }

        if (HttpMethod.GET.matches(method)) {
            return !path.matches("/api/estudiantes/\\d+")
                    && !path.matches("/api/calificacion-(materia|docente)/estudiante/.*");
        }
        return false;
    }

    private boolean rechazar(HttpServletResponse response) throws IOException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Se requiere una sesión válida");
        return false;
    }
}
