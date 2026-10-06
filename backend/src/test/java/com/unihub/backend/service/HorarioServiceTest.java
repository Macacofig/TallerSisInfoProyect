package com.unihub.backend.service;

import com.unihub.backend.ClassHelpers.Horario.HorarioTrabajo;
import com.unihub.backend.ClassHelpers.Horario.Oferta;
import com.unihub.backend.dto.horario.HorarioBloqueFiltroRequest;
import com.unihub.backend.dto.horario.HorarioBloqueRequest;
import com.unihub.backend.dto.horario.HorarioCantidadRequest;
import com.unihub.backend.dto.horario.HorarioFiltroRequest;
import com.unihub.backend.dto.horario.HorarioMateriaRequest;
import com.unihub.backend.dto.horario.HorarioOfertaRequest;
import com.unihub.backend.dto.horario.HorarioRequest;
import com.unihub.backend.dto.horario.HorarioResponse;
import com.unihub.backend.dto.horario.HorarioResultadoResponse;
import com.unihub.backend.mapper.horario.MapeoGeneracion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@TestMethodOrder(OrderAnnotation.class)
class HorarioServiceTest {

    private HorarioService horarioService;
    private HorarioGeneradorService horarioGeneradorService;
    private static int numeroPrueba;

    @BeforeEach
    void setUp() {
        horarioService = new HorarioService();
        horarioGeneradorService = new HorarioGeneradorService();
        numeroPrueba++;
    }

    private void mostrarResultado(String descripcion) {
        System.out.println("Test " + numeroPrueba + ": " + descripcion);
        System.out.println("Resultado : ok");
    }

    private HorarioRequest requestConMaterias(HorarioMateriaRequest... materias) {
        return new HorarioRequest(List.of(materias), new HorarioFiltroRequest(
                new HorarioCantidadRequest(1, 6),
                List.of(),
                List.of(),
                Map.of(),
                List.of(),
                false
        ));
    }

    private HorarioMateriaRequest materia(String nombre, HorarioOfertaRequest... ofertas) {
        return new HorarioMateriaRequest(nombre, List.of(ofertas));
    }

    private HorarioOfertaRequest oferta(String docente, HorarioBloqueRequest... horarios) {
        return new HorarioOfertaRequest(docente, List.of(horarios));
    }

    private HorarioBloqueRequest bloque(int dia, String horaInicio, String horaFin) {
        return new HorarioBloqueRequest(dia, horaInicio, horaFin);
    }

    @Test
    @Order(1)
    void test1TransformacionNombreAId() {
        MapeoGeneracion mapeo = new MapeoGeneracion();
        mapeo.registrarMateria("Programación I", 1L);
        mapeo.registrarDocente("Juan Pérez", 10L);

        assertEquals(1L, mapeo.getMateriasPorNombre().get("Programación I"));
        assertEquals(10L, mapeo.getDocentesPorNombre().get("Juan Pérez"));
        mostrarResultado("Transformación nombre a ID");
    }

    @Test
    @Order(2)
    void test2TransformacionIdANombre() {
        MapeoGeneracion mapeo = new MapeoGeneracion();
        mapeo.registrarMateria("Programación I", 1L);
        mapeo.registrarDocente("Juan Pérez", 10L);

        assertEquals("Programación I", mapeo.getNombresMateria().get(1L));
        assertEquals("Juan Pérez", mapeo.getNombresDocente().get(10L));
        mostrarResultado("Transformación ID a nombre");
    }

    @Test
    @Order(3)
    void test3CreacionCorrectaDeParalelos() {
        List<HorarioTrabajo> horarios = List.of(
                new HorarioTrabajo(1L, 10L, 1, LocalTime.of(8, 0), LocalTime.of(10, 0), 1, 1),
                new HorarioTrabajo(1L, 10L, 3, LocalTime.of(8, 0), LocalTime.of(10, 0), 1, 1)
        );

        Oferta oferta = new Oferta(1L, 10L, 1, horarios, 1);

        assertEquals(1, oferta.paralelo());
        assertEquals(2, oferta.horarios().size());
        mostrarResultado("Creación correcta de paralelos");
    }

    @Test
    @Order(4)
    void test4OfertaConVariosHorariosSeMantieneAgrupada() {
        List<HorarioTrabajo> horarios = List.of(
                new HorarioTrabajo(1L, 10L, 1, LocalTime.of(8, 0), LocalTime.of(10, 0), 1, 1),
                new HorarioTrabajo(1L, 10L, 3, LocalTime.of(8, 0), LocalTime.of(10, 0), 1, 1)
        );

        Oferta oferta = new Oferta(1L, 10L, 1, horarios, 1);

        assertEquals(2, oferta.horarios().size());
        assertEquals(1L, oferta.materiaId());
        assertEquals(10L, oferta.docenteId());
        mostrarResultado("Oferta con varios horarios se mantiene agrupada");
    }

    @Test
    @Order(5)
    void test5DosHorariosAdyacentesNoGeneranConflicto() {
        HorarioTrabajo a = new HorarioTrabajo(1L, 10L, 1, LocalTime.of(8, 0), LocalTime.of(10, 0), 1, 1);
        HorarioTrabajo b = new HorarioTrabajo(2L, 15L, 1, LocalTime.of(10, 0), LocalTime.of(12, 0), 1, 1);

        assertFalse(horarioGeneradorService.hayConflicto(a, b));
        mostrarResultado("Dos horarios adyacentes no generan conflicto");
    }

    @Test
    @Order(6)
    void test6DosHorariosSuperpuestosSiGeneranConflicto() {
        HorarioTrabajo a = new HorarioTrabajo(1L, 10L, 1, LocalTime.of(8, 0), LocalTime.of(10, 0), 1, 1);
        HorarioTrabajo b = new HorarioTrabajo(2L, 15L, 1, LocalTime.of(9, 0), LocalTime.of(11, 0), 1, 1);

        assertTrue(horarioGeneradorService.hayConflicto(a, b));
        mostrarResultado("Dos horarios superpuestos sí generan conflicto");
    }

    @Test
    @Order(7)
    void test7NoSePuedenSeleccionarDosOfertasDeLaMismaMateria() {
        HorarioRequest request = requestConMaterias(
                materia("Programación I",
                        oferta("Juan Pérez", bloque(1, "08:00", "10:00")),
                        oferta("María López", bloque(2, "08:00", "10:00"))),
                materia("Matemática",
                        oferta("Ana Fuentes", bloque(1, "10:00", "12:00")))
        );

        HorarioResponse response = horarioService.generar(request);
        assertNotNull(response);
        assertTrue(response.soluciones().isEmpty() || response.soluciones().stream().allMatch(solucion -> solucion.horarios().size() <= 2));
        mostrarResultado("No se pueden seleccionar dos ofertas de la misma materia");
    }

    @Test
    @Order(8)
    void test8MateriasExcluidasNoAparecen() {
        HorarioRequest request = requestConMaterias(
                materia("Programación I", oferta("Juan Pérez", bloque(1, "08:00", "10:00"))),
                materia("Matemática", oferta("Ana Fuentes", bloque(2, "08:00", "10:00")))
        );
        request = new HorarioRequest(
                request.materias(),
                new HorarioFiltroRequest(
                        new HorarioCantidadRequest(1, 2),
                        List.of(),
                        List.of(2L),
                        Map.of(),
                        List.of(),
                        false
                )
        );

        HorarioResponse response = horarioService.generar(request);
        assertTrue(response.soluciones().stream().allMatch(solucion -> solucion.horarios().stream().noneMatch(h -> h.materia().equals("Matemática"))));
        mostrarResultado("Materias excluidas no aparecen");
    }

    @Test
    @Order(9)
    void test9MateriasObligatoriasDebenAparecerCuandoExisteSolucionValida() {
        HorarioRequest request = requestConMaterias(
                materia("Programación I", oferta("Juan Pérez", bloque(1, "08:00", "10:00"))),
                materia("Matemática", oferta("Ana Fuentes", bloque(1, "10:00", "12:00")))
        );
        request = new HorarioRequest(
                request.materias(),
                new HorarioFiltroRequest(
                        new HorarioCantidadRequest(1, 2),
                        List.of(1L),
                        List.of(),
                        Map.of(),
                        List.of(),
                        false
                )
        );

        HorarioResponse response = horarioService.generar(request);
        assertFalse(response.soluciones().isEmpty());
        assertTrue(response.soluciones().stream().anyMatch(solucion -> solucion.horarios().stream().anyMatch(h -> h.materia().equals("Programación I"))));
        mostrarResultado("Materias obligatorias deben aparecer cuando existe una solución válida");
    }

    @Test
    @Order(10)
    void test10DocenteObligatorioDebeRespetarse() {
        HorarioRequest request = requestConMaterias(
                materia("Programación I", oferta("Juan Pérez", bloque(1, "08:00", "10:00"))),
                materia("Matemática", oferta("Ana Fuentes", bloque(1, "10:00", "12:00")))
        );
        request = new HorarioRequest(
                request.materias(),
                new HorarioFiltroRequest(
                        new HorarioCantidadRequest(1, 2),
                        List.of(),
                        List.of(),
                        Map.of(10L, List.of(1L)),
                        List.of(),
                        false
                )
        );

        HorarioResponse response = horarioService.generar(request);
        assertTrue(response.soluciones().stream().allMatch(solucion -> solucion.horarios().stream().noneMatch(h -> h.materia().equals("Programación I") && !h.docente().equals("Juan Pérez"))));
        mostrarResultado("Docente obligatorio debe respetarse");
    }

    @Test
    @Order(11)
    void test11HorariosNoDisponiblesNoEliminanLaOferta() {
        HorarioRequest request = requestConMaterias(
                materia("Programación I", oferta("Juan Pérez", bloque(1, "08:00", "10:00"))),
                materia("Matemática", oferta("Ana Fuentes", bloque(2, "08:00", "10:00")))
        );
        request = new HorarioRequest(
                request.materias(),
                new HorarioFiltroRequest(
                        new HorarioCantidadRequest(1, 2),
                        List.of(),
                        List.of(),
                        Map.of(),
                        List.of(new HorarioBloqueFiltroRequest(1, "08:00", "10:00")),
                        false
                )
        );

        HorarioResponse response = horarioService.generar(request);
        assertFalse(response.soluciones().isEmpty());
        mostrarResultado("Horarios no disponibles no deben eliminar automáticamente la oferta");
    }

    @Test
    @Order(12)
    void test12EvitarHuecosAfectaLaPuntuacion() {
        HorarioRequest request = requestConMaterias(
                materia("Programación I", oferta("Juan Pérez", bloque(1, "08:00", "10:00"), bloque(1, "10:00", "12:00"))),
                materia("Matemática", oferta("Ana Fuentes", bloque(1, "08:00", "10:00")))
        );
        request = new HorarioRequest(
                request.materias(),
                new HorarioFiltroRequest(
                        new HorarioCantidadRequest(1, 2),
                        List.of(),
                        List.of(),
                        Map.of(),
                        List.of(),
                        true
                )
        );

        HorarioResponse response = horarioService.generar(request);
        assertFalse(response.soluciones().isEmpty());
        assertTrue(response.soluciones().stream().allMatch(solucion -> solucion.puntuacion() >= 1));
        mostrarResultado("Evitar huecos debe afectar la puntuación");
    }

    @Test
    @Order(13)
    void test13LasSolucionesSeOrdenanPorPuntuacion() {
        HorarioRequest request = requestConMaterias(
                materia("Programación I", oferta("Juan Pérez", bloque(1, "08:00", "10:00"))),
                materia("Matemática", oferta("Ana Fuentes", bloque(1, "10:00", "12:00"))),
                materia("Física", oferta("Pedro Ruiz", bloque(1, "12:00", "14:00")))
        );
        request = new HorarioRequest(
                request.materias(),
                new HorarioFiltroRequest(
                        new HorarioCantidadRequest(1, 3),
                        List.of(),
                        List.of(),
                        Map.of(),
                        List.of(),
                        false
                )
        );

        HorarioResponse response = horarioService.generar(request);
        assertFalse(response.soluciones().isEmpty());
        for (int i = 1; i < response.soluciones().size(); i++) {
            assertTrue(response.soluciones().get(i - 1).puntuacion() >= response.soluciones().get(i).puntuacion());
        }
        mostrarResultado("Las soluciones se ordenan por puntuación");
    }

    @Test
    @Order(14)
    void test14ElBacktrackingDebeProducirSolucionesValidas() {
        HorarioRequest request = requestConMaterias(
                materia("Programación I", oferta("Juan Pérez", bloque(1, "08:00", "10:00"))),
                materia("Matemática", oferta("Ana Fuentes", bloque(1, "10:00", "12:00"))),
                materia("Física", oferta("Pedro Ruiz", bloque(2, "08:00", "10:00")))
        );
        request = new HorarioRequest(
                request.materias(),
                new HorarioFiltroRequest(
                        new HorarioCantidadRequest(2, 3),
                        List.of(),
                        List.of(),
                        Map.of(),
                        List.of(),
                        false
                )
        );

        HorarioResponse response = horarioService.generar(request);
        assertFalse(response.soluciones().isEmpty());
        for (HorarioResultadoResponse solucion : response.soluciones()) {
            assertTrue(solucion.cantidadMaterias() >= 2);
            assertTrue(solucion.horarios().size() >= 2);
        }
        mostrarResultado("El backtracking debe producir soluciones válidas");
    }
}
