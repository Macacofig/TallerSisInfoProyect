package com.unihub.backend.dto.actividad;

import com.unihub.backend.entity.ActividadEstudiante;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ActividadEstudianteRequest(
        @NotNull(message = "El estudiante es obligatorio")
        Long idEstudiante,

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 255, message = "El título no debe superar los 255 caracteres")
        String titulo,

        @NotBlank(message = "La descripción es obligatoria")
        String descripcion,

        ActividadEstudiante.EstadoActividad estado
) {
    public ActividadEstudianteRequest {
        titulo = normalizar(titulo);
        descripcion = normalizar(descripcion);
    }

    private static String normalizar(String valor) {
        return valor == null ? null : valor.trim();
    }
}
