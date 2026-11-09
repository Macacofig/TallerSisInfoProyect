package com.unihub.backend.dto.actividad;

import com.unihub.backend.entity.ActividadEstudiante;
import jakarta.validation.constraints.Size;

public record ActividadEstudianteActualizacionRequest(
        @Size(max = 255, message = "El título no debe superar los 255 caracteres")
        String titulo,

        String descripcion,

        ActividadEstudiante.EstadoActividad estado
) {
    public ActividadEstudianteActualizacionRequest {
        titulo = normalizar(titulo);
        descripcion = normalizar(descripcion);
    }

    private static String normalizar(String valor) {
        return valor == null ? null : valor.trim();
    }
}
