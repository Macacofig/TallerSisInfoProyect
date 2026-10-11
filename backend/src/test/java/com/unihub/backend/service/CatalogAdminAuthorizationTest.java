package com.unihub.backend.service;

import com.unihub.backend.exception.AccesoNoAutorizadoException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class CatalogAdminAuthorizationTest {

    @Test
    void permiteSoloElTokenAdministrativoConfigurado() {
        String configuredToken = "catalog-admin-test-token-with-at-least-32-bytes";
        CatalogAdminAuthorization authorization = new CatalogAdminAuthorization(configuredToken);

        assertDoesNotThrow(() -> authorization.requerirAdministrador(configuredToken));
        assertThrows(AccesoNoAutorizadoException.class,
                () -> authorization.requerirAdministrador("student-jwt"));
        assertThrows(AccesoNoAutorizadoException.class,
                () -> authorization.requerirAdministrador(null));
    }

    @Test
    void rechazaTodasLasEscriturasCuandoNoHayTokenConfigurado() {
        CatalogAdminAuthorization authorization = new CatalogAdminAuthorization("");

        assertThrows(AccesoNoAutorizadoException.class,
                () -> authorization.requerirAdministrador("any-token"));
    }

    @Test
    void rechazaTokensAdministrativosDebiles() {
        assertThrows(IllegalArgumentException.class, () -> new CatalogAdminAuthorization("too-short"));
    }
}
