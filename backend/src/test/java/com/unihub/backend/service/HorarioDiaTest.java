package com.unihub.backend.service;

import com.unihub.backend.common.DiaSemana;
import com.unihub.backend.dto.horario.HorarioBloqueFiltroRequest;
import com.unihub.backend.dto.horario.HorarioBloqueRequest;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class HorarioDiaTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void mapeaNombreLiteralDeDia() {
        assertEquals(1, DiaSemana.numero("Lunes"));
        assertEquals(6, DiaSemana.numero("Sábado"));
        assertEquals(6, DiaSemana.numero("Sabado"));
        assertEquals(3, DiaSemana.numero("Miércoles"));
        assertEquals(7, DiaSemana.numero("Domingo"));
        assertEquals(2, DiaSemana.numero("2"));
        assertNull(DiaSemana.numero("_______"));
        assertNull(DiaSemana.numero("NoExiste"));
    }

    @Test
    void convierteNumeroARotuloLiteral() {
        assertEquals("Lunes", DiaSemana.nombre(1));
        assertEquals("Sábado", DiaSemana.nombre(6));
        assertEquals("Domingo", DiaSemana.nombre(7));
        assertEquals("", DiaSemana.nombre(0));
        assertEquals("", DiaSemana.nombre(8));
    }

    @Test
    void deserializaDiaComoNombreOComoNumero() throws Exception {
        String conNombre = """
                {"DocenteNombre1": "Juan Pérez", "Dia": "Sábado", "horas": "08:00 - 10:00"}
                """;
        String conNumero = """
                {"docenteNombre1": "Juan Pérez", "dia": 6, "horas": "08:00 - 10:00"}
                """;

        HorarioBloqueRequest porNombre = objectMapper.readValue(conNombre, HorarioBloqueRequest.class);
        HorarioBloqueRequest porNumero = objectMapper.readValue(conNumero, HorarioBloqueRequest.class);

        assertEquals(6, porNombre.dia());
        assertEquals(6, porNumero.dia());
    }

    @Test
    void deserializaDiaInvalidoComoCeroParaFiltrarlo() throws Exception {
        String conInvalido = """
                {"DocenteNombre1": "Juan Pérez", "Dia": "_______", "horas": "______"}
                """;

        HorarioBloqueFiltroRequest filtro = objectMapper.readValue(
                "{\"dia\": \"_______\", \"horaInicio\": \"08:00\", \"horaFin\": \"10:00\"}",
                HorarioBloqueFiltroRequest.class);

        HorarioBloqueRequest bloque = objectMapper.readValue(conInvalido, HorarioBloqueRequest.class);

        assertEquals(0, bloque.dia());
        assertEquals(0, filtro.dia());
    }
}