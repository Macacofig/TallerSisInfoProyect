package com.unihub.backend.dto.docente;

import jakarta.validation.constraints.NotBlank;

public record DocenteRequest(
	@NotBlank String nombre
) {
}
