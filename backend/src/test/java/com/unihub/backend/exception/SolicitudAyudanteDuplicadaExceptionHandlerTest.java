package com.unihub.backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import static org.junit.jupiter.api.Assertions.assertEquals;

class SolicitudAyudanteDuplicadaExceptionHandlerTest {
    @Test
    void devuelve409ParaSolicitudDuplicada() {
        var handler = new GlobalExceptionHandler();
        var excepcion = new SolicitudAyudanteDuplicadaException("Solicitud duplicada");

        var respuesta = handler.manejarSolicitudAyudanteDuplicada(excepcion);

        assertEquals(HttpStatus.CONFLICT, respuesta.getStatusCode());
        assertEquals("Solicitud duplicada", respuesta.getBody());
    }
}
