package com.unihub.backend.dto.horario;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record HorarioRequest(
        @NotNull List<HorarioMateriaRequest> materias,
        HorarioFiltroRequest filtros
) {
}
