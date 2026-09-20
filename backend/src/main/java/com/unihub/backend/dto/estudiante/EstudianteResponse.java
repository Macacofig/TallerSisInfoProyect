package com.unihub.backend.dto.estudiante;

public record EstudianteResponse(
        Long id,
        String nombre,
        String telefono,
        String correoElectronico,
        String carrera
) {
}
