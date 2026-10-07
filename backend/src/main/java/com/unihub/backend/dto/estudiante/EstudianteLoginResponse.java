package com.unihub.backend.dto.estudiante;

public record EstudianteLoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long id,
        String nombre,
        String telefono,
        String correoElectronico,
        String carrera
) {
    public EstudianteLoginResponse(String accessToken, long expiresIn, EstudianteResponse estudiante) {
        this(
                accessToken,
                "Bearer",
                expiresIn,
                estudiante.id(),
                estudiante.nombre(),
                estudiante.telefono(),
                estudiante.correoElectronico(),
                estudiante.carrera()
        );
    }
}