package com.unihub.backend.dto.docente;

import jakarta.validation.constraints.NotNull;

public record DocenteMateriaRequest(
        @NotNull Long idDocente,
        @NotNull Long idMateria
) {
}