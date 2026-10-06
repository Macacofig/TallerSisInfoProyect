package com.unihub.backend.service;

import com.unihub.backend.dto.horario.HorarioBloqueFiltroRequest;
import com.unihub.backend.dto.horario.HorarioBloqueRequest;
import com.unihub.backend.dto.horario.HorarioCantidadRequest;
import com.unihub.backend.dto.horario.HorarioFiltroRequest;
import com.unihub.backend.dto.horario.HorarioGeneracionRequest;
import com.unihub.backend.dto.horario.HorarioMateriaRequest;
import com.unihub.backend.dto.horario.HorarioNormalizacionResponse;
import com.unihub.backend.dto.horario.HorarioResponse1;
import com.unihub.backend.dto.horario.HorarioResponse2;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HorarioSchedulingFlowTest {

    private HorarioService horarioService;

    @BeforeEach
    void setUp() {
        horarioService = new HorarioService();
    }

    @Test
    void normalizaSiglasRepetidasComoUnaMateriaConOfertasSeparadas() {
        HorarioNormalizacionResponse response = horarioService.normalizarEntradaCruda(materiasCrudas());

        assertEquals(2, response.materias().size());
        HorarioResponse1 matematica = response.materias().getFirst();
        assertEquals("Matemática I", matematica.nombreMateria());
        assertEquals(3, matematica.ofertas().size());
        assertEquals(2, matematica.ofertas().getFirst().horarios().size());
        assertEquals(1, matematica.ofertas().getFirst().paralelo());
        assertEquals("Juan Pérez", matematica.ofertas().getFirst().docente());
        assertTrue(response.sessionId() != null && !response.sessionId().isBlank());
    }

    @Test
    void generaDesdeSesionYAplicaMateriasDocenteYHorarioNoDisponible() {
        HorarioNormalizacionResponse normalizado = horarioService.normalizarEntradaCruda(materiasCrudas());
        HorarioResponse1 matematica = normalizado.materias().getFirst();
        Long materiaId = matematica.idMateria();
        Long docenteJuanId = matematica.ofertas().stream()
                .filter(oferta -> oferta.docente().equals("Juan Pérez"))
                .findFirst().orElseThrow().idDocente();
        Long fisicaId = normalizado.materias().get(1).idMateria();

        HorarioFiltroRequest filtros = new HorarioFiltroRequest(
                new HorarioCantidadRequest(1, 1),
                List.of(materiaId),
                List.of(fisicaId),
                Map.of(docenteJuanId, List.of(materiaId)),
                List.of(new HorarioBloqueFiltroRequest(1, "08:00", "09:00")),
                false
        );
        List<HorarioResponse2> soluciones = horarioService.generarDesdeSession(
                new HorarioGeneracionRequest(normalizado.sessionId(), filtros));

        assertFalse(soluciones.isEmpty());
        for (HorarioResponse2 solucion : soluciones) {
            assertEquals(1, solucion.cantidadMaterias());
            assertEquals(1, solucion.horarios().size());
            assertEquals("Matemática I", solucion.horarios().getFirst().materia());
            assertEquals("Juan Pérez", solucion.horarios().getFirst().docente());
            assertTrue(solucion.horarios().getFirst().horarios().stream()
                    .allMatch(bloque -> bloque.dia() != 1));
        }
        assertTrue(horarioService.generarDesdeSession(
                new HorarioGeneracionRequest(normalizado.sessionId(), filtros)).isEmpty());
    }

    @Test
    void conservaElRangoHorarioDelFormatoCrudoEnLaRespuestaNormalizada() {
        List<HorarioMateriaRequest> request = List.of(new HorarioMateriaRequest(
                "MAT101", 1, "Matemática I",
                List.of(new HorarioBloqueRequest("Juan Pérez", 1, "14:15 - 15:45"))));

        HorarioResponse1 materia = horarioService.normalizarEntradaCruda(request).materias().getFirst();

        assertEquals("Juan Pérez", materia.ofertas().getFirst().docente());
        assertEquals("14:15 - 15:45", materia.ofertas().getFirst().horarios().getFirst().horas());
    }

    private List<HorarioMateriaRequest> materiasCrudas() {
        return List.of(
                new HorarioMateriaRequest("MAT101", 1, "Matemática I", List.of(
                        new HorarioBloqueRequest("Juan Pérez", 1, "08:00 - 09:00"),
                        new HorarioBloqueRequest("Juan Pérez", 3, "10:00 - 11:00"))),
                new HorarioMateriaRequest("MAT101", 2, "Matemática I", List.of(
                        new HorarioBloqueRequest("Juan Pérez", 2, "08:00 - 09:00"))),
                new HorarioMateriaRequest("MAT101", 3, "Matemática I", List.of(
                        new HorarioBloqueRequest("Ana Gómez", 4, "12:00 - 13:00"))),
                new HorarioMateriaRequest("FIS201", 1, "Física", List.of(
                        new HorarioBloqueRequest("Pedro Rojas", 1, "10:00 - 11:00")))
        );
    }
}