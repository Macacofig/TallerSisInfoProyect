package com.unihub.backend.dto.horario;

import java.util.List;

public record HorarioMateriaRequest(
        String nombre,
        List<HorarioOfertaRequest> ofertas
) {
}
