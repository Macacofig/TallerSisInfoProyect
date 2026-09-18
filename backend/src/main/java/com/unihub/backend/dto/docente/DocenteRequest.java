package com.unihub.backend.dto.docente;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DocenteRequest(
	@NotBlank String nombre,
	@NotNull Long idMateria
) {
}
