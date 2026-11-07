package com.unihub.backend.dto.estudiante;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EstudianteRecuperarContrasenaRequest(
        @NotBlank(message = "El correo electrónico es obligatorio")
        @Pattern(
                regexp = "^[A-Za-z0-9._%+-]+@ucb\\.edu\\.bo$",
                message = "El correo electrónico debe pertenecer al dominio @ucb.edu.bo"
        )
        String correoElectronico,

        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d\\s]).+$",
                message = "La contraseña debe incluir una mayúscula, un número y un carácter especial"
        )
        String nuevaContrasena,

        @NotBlank(message = "La confirmación de la contraseña es obligatoria")
        String confirmarNuevaContrasena
) {
    public EstudianteRecuperarContrasenaRequest {
        correoElectronico = normalizar(correoElectronico);
        nuevaContrasena = normalizar(nuevaContrasena);
        confirmarNuevaContrasena = normalizar(confirmarNuevaContrasena);
    }

    private static String normalizar(String valor) {
        return valor == null ? null : valor.trim();
    }
}
