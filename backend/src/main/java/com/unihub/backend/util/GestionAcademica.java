package com.unihub.backend.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public record GestionAcademica(String gestion, Integer anio, String semestre)
        implements Comparable<GestionAcademica> {

    private static final Pattern GESTION_CON_ANIO =
            Pattern.compile("^(\\d{4})-(I|II|1|2)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern GESTION_SIN_ANIO = Pattern.compile(
            "^(?:año-(I|II)|(I|II)-año)$",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    public static GestionAcademica normalizar(String gestionOriginal) {
        String valor = gestionOriginal.trim();
        Matcher conAnio = GESTION_CON_ANIO.matcher(valor);
        if (conAnio.matches()) {
            String semestre = normalizarSemestre(conAnio.group(2));
            return new GestionAcademica(
                    conAnio.group(1) + "-" + semestre,
                    Integer.valueOf(conAnio.group(1)),
                    semestre
            );
        }

        Matcher sinAnio = GESTION_SIN_ANIO.matcher(valor);
        if (sinAnio.matches()) {
            String semestre = normalizarSemestre(
                    sinAnio.group(1) == null ? sinAnio.group(2) : sinAnio.group(1)
            );
            return new GestionAcademica("año-" + semestre, null, semestre);
        }

        return new GestionAcademica(valor, null, null);
    }

    @Override
    public int compareTo(GestionAcademica otra) {
        if (anio != null && otra.anio != null) {
            int comparacionAnio = anio.compareTo(otra.anio);
            if (comparacionAnio != 0) {
                return comparacionAnio;
            }
        } else if (anio != null) {
            return -1;
        } else if (otra.anio != null) {
            return 1;
        }

        int comparacionSemestre = Integer.compare(
                ordenSemestre(semestre),
                ordenSemestre(otra.semestre)
        );
        if (comparacionSemestre != 0) {
            return comparacionSemestre;
        }
        return gestion.compareTo(otra.gestion);
    }

    private static String normalizarSemestre(String semestre) {
        return semestre.equalsIgnoreCase("I") || semestre.equals("1") ? "I" : "II";
    }

    private static int ordenSemestre(String semestre) {
        return switch (semestre == null ? "" : semestre) {
            case "I" -> 1;
            case "II" -> 2;
            default -> 3;
        };
    }
}
