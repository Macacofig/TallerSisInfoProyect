package com.unihub.backend.dto.estudiante;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EstudianteRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d\\s]).+$",
                message = "La contraseña debe incluir una mayúscula, un número y un carácter especial"
        )
        String contrasena,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = "^[67]\\d{7}$", message = "El teléfono debe empezar por 6 o 7 y tener 8 dígitos")
        String telefono,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Pattern(
                regexp = "^[A-Za-z0-9._%+-]+@ucb\\.edu\\.bo$",
                message = "El correo electrónico debe pertenecer al dominio @ucb.edu.bo"
        )
        String correoElectronico,

        @NotBlank(message = "La carrera es obligatoria")
        String carrera
) {
    public EstudianteRequest {
        nombre = normalizar(nombre);
        contrasena = normalizar(contrasena);
        telefono = normalizar(telefono);
        correoElectronico = normalizar(correoElectronico);
        carrera = normalizar(carrera);
    }

    private static String normalizar(String valor) {
        return valor == null ? null : valor.trim().replaceAll("\\s+", " ");
    }
}
