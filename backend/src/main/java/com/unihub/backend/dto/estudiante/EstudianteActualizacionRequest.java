package com.unihub.backend.dto.estudiante;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EstudianteActualizacionRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = "^[67]\\d{7}$", message = "El teléfono debe empezar por 6 o 7 y tener 8 dígitos")
        String telefono,

        @NotBlank(message = "La carrera es obligatoria")
        String carrera
) {
    public EstudianteActualizacionRequest {
        nombre = normalizar(nombre);
        telefono = normalizar(telefono);
        carrera = normalizar(carrera);
    }

    private static String normalizar(String valor) {
        return valor == null ? null : valor.trim().replaceAll("\\s+", " ");
    }
}