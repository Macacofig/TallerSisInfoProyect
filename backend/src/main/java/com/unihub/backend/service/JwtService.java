package com.unihub.backend.service;

import com.unihub.backend.entity.Estudiante;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationSeconds;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-seconds:3600}") long expirationSeconds
    ) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET debe tener al menos 32 bytes");
        }
        if (expirationSeconds <= 0) {
            throw new IllegalArgumentException("La duración del JWT debe ser positiva");
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationSeconds = expirationSeconds;
    }

    public String generarToken(Estudiante estudiante) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(estudiante.getCorreoElectronico())
                .claim("studentId", estudiante.getId())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusSeconds(expirationSeconds)))
                .signWith(signingKey)
                .compact();
    }

    public long obtenerDuracionSegundos() {
        return expirationSeconds;
    }
}