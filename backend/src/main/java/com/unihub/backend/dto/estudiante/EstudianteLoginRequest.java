package com.unihub.backend.dto.estudiante;

import jakarta.validation.constraints.NotBlank;

public record EstudianteLoginRequest(
        @NotBlank(message = "El correo electrónico es obligatorio")
        String correoElectronico,

        @NotBlank(message = "La contraseña es obligatoria")
        String contrasena
) {
    public EstudianteLoginRequest {
        correoElectronico = normalizar(correoElectronico);
        contrasena = normalizar(contrasena);
    }

    private static String normalizar(String valor) {
        return valor == null ? null : valor.trim();
    }
}
