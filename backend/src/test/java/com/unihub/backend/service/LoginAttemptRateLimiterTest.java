package com.unihub.backend.service;

import com.unihub.backend.exception.TooManyLoginAttemptsException;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class LoginAttemptRateLimiterTest {
    @Test
    void bloqueaTrasCincoFallos() {
        Clock clock = Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);
        LoginAttemptRateLimiter limiter = new LoginAttemptRateLimiter(clock);
        for (int i = 0; i < 5; i++) limiter.registrarFallo("user@example.com");

        assertThrows(TooManyLoginAttemptsException.class,
                () -> limiter.verificarPermitido("USER@example.com"));
    }

    @Test
    void exitoLimpiaElContador() {
        LoginAttemptRateLimiter limiter = new LoginAttemptRateLimiter();
        for (int i = 0; i < 5; i++) limiter.registrarFallo("user@example.com");
        limiter.registrarExito("user@example.com");
        assertDoesNotThrow(() -> limiter.verificarPermitido("user@example.com"));
    }
}
