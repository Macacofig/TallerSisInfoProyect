package com.unihub.backend.dto.calificacion;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record CalificacionRequest(

	@NotNull Long idMateria,
	Long idEstudiante,

	@NotNull @Min(1) @Max(10) Integer dificultad,
	@NotNull @Min(1) @Max(10) Integer carga,
	@NotNull @Min(1) @Max(10) Integer conocimientoPrevio,

	@NotNull List<@NotBlank String> prerequisitos,

	@NotBlank
	@Pattern(regexp = "Practico|Teorico")
	String predominio,

	@NotBlank String gestion
) {
}
