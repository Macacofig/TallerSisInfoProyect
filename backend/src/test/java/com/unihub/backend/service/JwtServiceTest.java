package com.unihub.backend.service;

import com.unihub.backend.entity.Estudiante;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtServiceTest {

    private static final String SECRET = "test-secret-key-with-at-least-32-bytes";

    @Test
    void obtieneLaIdentidadDeUnTokenFirmado() {
        Estudiante estudiante = mock(Estudiante.class);
        when(estudiante.getId()).thenReturn(42L);
        when(estudiante.getCorreoElectronico()).thenReturn("ana@ucb.edu.bo");

        JwtService jwtService = new JwtService(SECRET, 3600);
        String token = jwtService.generarToken(estudiante);

        assertEquals(42L, jwtService.obtenerIdEstudiante(token).orElseThrow());
    }

    @Test
    void rechazaTokensAlteradosYOtrosFirmantes() {
        Estudiante estudiante = mock(Estudiante.class);
        when(estudiante.getId()).thenReturn(42L);
        when(estudiante.getCorreoElectronico()).thenReturn("ana@ucb.edu.bo");

        String token = new JwtService(SECRET, 3600).generarToken(estudiante);

        assertTrue(new JwtService("another-secret-key-with-32-bytes", 3600)
                .obtenerIdEstudiante(token).isEmpty());
        assertTrue(new JwtService(SECRET, 3600)
                .obtenerIdEstudiante(token + "tampered").isEmpty());
    }

    @Test
    void requiereTokenValidoYPropietarioParaAccederAlRecurso() {
        Estudiante estudiante = mock(Estudiante.class);
        when(estudiante.getId()).thenReturn(42L);
        when(estudiante.getCorreoElectronico()).thenReturn("ana@ucb.edu.bo");
        JwtService jwtService = new JwtService(SECRET, 3600);
        String token = jwtService.generarToken(estudiante);

        assertThrows(RuntimeException.class, () -> jwtService.requerirPropietario(null, 42L));
        assertThrows(RuntimeException.class, () -> jwtService.requerirPropietario("Bearer " + token, 41L));
        jwtService.requerirPropietario("Bearer " + token, 42L);
    }
}
