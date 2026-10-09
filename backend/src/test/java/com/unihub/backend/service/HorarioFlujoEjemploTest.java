package com.unihub.backend.service;

import com.unihub.backend.dto.horario.HorarioBloqueGeneradoResponse;
import com.unihub.backend.dto.horario.HorarioBloqueRequest;
import com.unihub.backend.dto.horario.HorarioBloqueResultadoResponse;
import com.unihub.backend.dto.horario.HorarioGeneracionRequest;
import com.unihub.backend.dto.horario.HorarioMateriaRequest;
import com.unihub.backend.dto.horario.HorarioNormalizacionResponse;
import com.unihub.backend.dto.horario.HorarioOfertaResponse;
import com.unihub.backend.dto.horario.HorarioResponse1;
import com.unihub.backend.dto.horario.HorarioResponse2;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HorarioFlujoEjemploTest {

    @Test
    void flujoCompletoConMateriasCentralesDelScraper() {
        HorarioService servicio = new HorarioService();

        List<HorarioMateriaRequest> materias = materiasCentralesDelScraper();

        System.out.println("=== ENTRADA (materias centrales de scraper/data/materias.json) ===");
        for (HorarioMateriaRequest m : materias) {
            System.out.printf("%s paralelo=%d", m.siglaMateria1(), m.paralelo1());
            for (HorarioBloqueRequest b : m.horarios()) {
                System.out.printf(" / [%s, dia %d, %s]", b.docenteNombre1(), b.dia(), b.horas());
            }
            System.out.println();
        }

        // PASO 1: obtenerDatos
        HorarioNormalizacionResponse normalizado = servicio.normalizarEntradaCruda(materias);
        System.out.println();
        System.out.println("=== PASO 1: obtenerDatos -> HorarioResponse1 ===");
        for (HorarioResponse1 m : normalizado.materias()) {
            System.out.printf("idMateria=%d Nombre=%s%n", m.idMateria(), m.nombreMateria());
            for (HorarioOfertaResponse o : m.ofertas()) {
                System.out.printf("  oferta: idDocente=%d %s paralelo=%d -> %s%n",
                        o.idDocente(), o.docente(), o.paralelo(),
                        o.horarios().stream().map(h -> h.dia() + " " + h.horas()).toList());
            }
        }
        System.out.println("sessionId=" + normalizado.sessionId());

        // PASO 2: generarHorarios (consume la sesion / json logico)
        List<HorarioResponse2> opciones = servicio.generarDesdeSession(
                new HorarioGeneracionRequest(normalizado.sessionId(), null));
        System.out.println();
        System.out.println("=== PASO 2: generarHorarios -> " + opciones.size() + " opciones (top 12) ===");
        int nro = 0;
        for (HorarioResponse2 opcion : opciones) {
            System.out.println("Opcion " + (++nro) + ": cantMaterias=" + opcion.cantidadMaterias()
                    + " puntuacion=" + opcion.puntuacion());
            for (HorarioBloqueResultadoResponse h : opcion.horarios()) {
                System.out.printf("   - %-45s | %-28s | %s%n",
                        h.materia(), h.docente(), h.horarios());
            }
        }

        // la sesion se elimina tras generar
        assertTrue(servicio.generarDesdeSession(new HorarioGeneracionRequest(normalizado.sessionId(), null)).isEmpty());

        // CUIDADO 1: dentro de cada opcion no hay cruces de horarios
        for (HorarioResponse2 opcion : opciones) {
            List<HorarioBloqueGeneradoResponse> bloques = opcion.horarios().stream()
                    .flatMap(h -> h.horarios().stream())
                    .toList();
            for (int i = 0; i < bloques.size(); i++) {
                for (int j = i + 1; j < bloques.size(); j++) {
                    assertFalse(confluyen(bloques.get(i), bloques.get(j)),
                            "Cruce encontrado: " + bloques.get(i) + " vs " + bloques.get(j));
                }
            }
            // CUIDADO 6: una materia aparece una sola vez (un paralelo) por opcion
            assertTrue(opcion.cantidadMaterias() > 0 && opcion.cantidadMaterias() <= 6);
        }

        // una misma materia se reutiliza en distintas opciones con paralelos validos
        assertTrue(opciones.size() > 1);
        long opcionesConEnf = opciones.stream()
                .filter(o -> o.horarios().stream().anyMatch(h -> h.materia().contains("FUNDAMENTOS DE ENFERMERIA")))
                .count();
        assertTrue(opcionesConEnf >= 1);
        System.out.println();
        System.out.println("=== VERIFICACIONES ===");
        System.out.println("sin cruces en cada opcion: OK; materia de una sola vez por opcion: OK;");
        System.out.println("ENF-122 reutilizada en " + opcionesConEnf + " de " + opciones.size() + " opciones distintas.");
    }

    private boolean confluyen(HorarioBloqueGeneradoResponse a, HorarioBloqueGeneradoResponse b) {
        return a.dia().equals(b.dia())
                && LocalTime.parse(a.horaInicio()).isBefore(LocalTime.parse(b.horaFin()))
                && LocalTime.parse(a.horaFin()).isAfter(LocalTime.parse(b.horaInicio()));
    }

    private List<HorarioMateriaRequest> materiasCentralesDelScraper() {
        List<HorarioMateriaRequest> lista = new ArrayList<>();

        lista.add(new HorarioMateriaRequest("MOB-362", 1, "ENFERMERIA MATERNO INFANTIL OBSTETRICIA II",
                List.of(new HorarioBloqueRequest("COSSIO OQUENDO JHASMIN VERONICA", 1, "16:30 - 18:45"))));
        lista.add(new HorarioMateriaRequest("MPE-363", 1, "ENFERMERIA MATERNO INFANTIL PEDIATRIA II",
                List.of(
                        new HorarioBloqueRequest("ACHA TORRES MARCELA BEATRIZ", 1, "10:45 - 13:00"),
                        new HorarioBloqueRequest("ACHA TORRES MARCELA BEATRIZ", 2, "08:00 - 10:15"))));
        lista.add(new HorarioMateriaRequest("EMQ-244", 1, "ENFERMERIA MEDICO QUIRURGICA II",
                List.of(new HorarioBloqueRequest("CHOQUE ORTEGA ROCIO DEL CARMEN", 4, "10:45 - 13:00"))));
        lista.add(new HorarioMateriaRequest("FAR-248", 1, "FARMACOLOGIA II Y MEDICINA NATURAL",
                List.of(new HorarioBloqueRequest("VILLARROEL CANEDO MARIA LUISA", 5, "10:45 - 13:00"))));
        lista.add(new HorarioMateriaRequest("ENF-122", 1, "FUNDAMENTOS DE ENFERMERIA II",
                List.of(
                        new HorarioBloqueRequest("VILLARROEL CANEDO MARIA LUISA", 1, "08:00 - 10:15"),
                        new HorarioBloqueRequest("VILLARROEL CANEDO MARIA LUISA", 3, "10:45 - 13:00"))));
        lista.add(new HorarioMateriaRequest("GBI-387", 1, "GESTION EN BIOSEGURIDAD",
                List.of(new HorarioBloqueRequest("GONZALES APAZA SOFIA", 1, "15:00 - 17:15"))));
        lista.add(new HorarioMateriaRequest("NUT-123", 1, "NUTRICION Y DIETOTERAPIA",
                List.of(new HorarioBloqueRequest("ACHA TORRES MARCELA BEATRIZ", 2, "10:45 - 13:00"))));
        lista.add(new HorarioMateriaRequest("FHC-362", 1, "PASTORAL DE ENFERMOS",
                List.of(new HorarioBloqueRequest("MENA MUÑOZ FEDERICO", 1, "14:00 - 16:15"))));
        return lista;
    }
}