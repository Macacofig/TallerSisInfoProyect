package com.unihub.backend.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GestionAcademicaTest {

    @Test
    void normalizaFormatosEquivalentesSinFusionarAnosDistintos() {
        assertEquals("2026-I", GestionAcademica.normalizar("2026-1").gestion());
        assertEquals("2026-II", GestionAcademica.normalizar("2026-2").gestion());
        assertNotEquals(
                GestionAcademica.normalizar("2026-I"),
                GestionAcademica.normalizar("2027-I")
        );
        assertNotEquals(
                GestionAcademica.normalizar("2026-II"),
                GestionAcademica.normalizar("2027-II")
        );
    }

    @Test
    void agrupaEtiquetasHeredadasSinAtribuirlesUnAno() {
        GestionAcademica primero = GestionAcademica.normalizar("año-I");
        GestionAcademica alias = GestionAcademica.normalizar("I-Año");

        assertEquals(primero, alias);
        assertNull(primero.anio());
        assertEquals("año-I", primero.gestion());
        assertEquals(
                GestionAcademica.normalizar("año-II"),
                GestionAcademica.normalizar("II-Año")
        );
        assertNull(GestionAcademica.normalizar("II-Año").anio());
    }

    @Test
    void comparaPeriodosFechadosPorAnoYSemestre() {
        assertTrue(
                GestionAcademica.normalizar("2026-I")
                        .compareTo(GestionAcademica.normalizar("2025-II")) > 0
        );
        assertTrue(
                GestionAcademica.normalizar("2026-II")
                        .compareTo(GestionAcademica.normalizar("2026-I")) > 0
        );
    }
}
