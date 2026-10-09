package com.unihub.backend.common;

import com.unihub.backend.mapper.horario.MapeoGeneracion;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public final class DiaSemana {

    private static final String[] NOMBRES = {
            "", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
    };

    private static final Map<String, Integer> POR_NOMBRE = new HashMap<>();

    static {
        for (int i = 1; i < NOMBRES.length; i++) {
            POR_NOMBRE.put(MapeoGeneracion.normalizarTexto(NOMBRES[i]), i);
            POR_NOMBRE.put(NOMBRES[i].toLowerCase(Locale.ROOT), i);
        }
    }

    private DiaSemana() {
    }

    public static Integer numero(String dia) {
        if (dia == null) {
            return null;
        }

        String limpio = dia.trim();
        if (limpio.isEmpty()) {
            return null;
        }

        try {
            return Integer.valueOf(limpio);
        } catch (NumberFormatException ignored) {
        }

        Integer porNormalizado = POR_NOMBRE.get(MapeoGeneracion.normalizarTexto(limpio));
        if (porNormalizado != null) {
            return porNormalizado;
        }

        return POR_NOMBRE.get(limpio.toLowerCase(Locale.ROOT));
    }

    public static String nombre(int dia) {
        if (dia < 1 || dia > 7) {
            return "";
        }
        return NOMBRES[dia];
    }
}