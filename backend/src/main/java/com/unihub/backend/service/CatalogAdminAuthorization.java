package com.unihub.backend.service;

import com.unihub.backend.exception.AccesoNoAutorizadoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class CatalogAdminAuthorization {

    private final byte[] adminToken;

    public CatalogAdminAuthorization(@Value("${app.security.catalog-admin-token:}") String adminToken) {
        this.adminToken = adminToken.getBytes(StandardCharsets.UTF_8);
        if (this.adminToken.length > 0 && this.adminToken.length < 32) {
            throw new IllegalArgumentException("CATALOG_ADMIN_TOKEN debe tener al menos 32 bytes");
        }
    }

    public void requerirAdministrador(String token) {
        if (adminToken.length == 0 || token == null || token.isBlank()
                || !MessageDigest.isEqual(adminToken, token.getBytes(StandardCharsets.UTF_8))) {
            throw new AccesoNoAutorizadoException();
        }
    }
}
