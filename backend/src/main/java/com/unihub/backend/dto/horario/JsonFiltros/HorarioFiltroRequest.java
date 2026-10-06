package com.unihub.backend.dto.horario;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public record HorarioFiltroRequest(
        HorarioCantidadRequest cantidadMaterias,
        List<Long> materiasObligatorias,
        List<Long> materiasExcluidas,
        Map<Long, List<Long>> docentes,
        List<HorarioBloqueFiltroRequest> horariosNoDisponibles,
        Boolean evitarHuecos
) {
    public HorarioFiltroRequest {
        if (cantidadMaterias == null) {
            cantidadMaterias = new HorarioCantidadRequest(4, 6);
        }
        if (materiasObligatorias == null) {
            materiasObligatorias = Collections.emptyList();
        }
        if (materiasExcluidas == null) {
            materiasExcluidas = Collections.emptyList();
        }
        if (docentes == null) {
            docentes = Collections.emptyMap();
        }
        if (horariosNoDisponibles == null) {
            horariosNoDisponibles = Collections.emptyList();
        }
        if (evitarHuecos == null) {
            evitarHuecos = false;
        }
    }
}
