package com.unihub.backend.integration;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;

import java.sql.DriverManager;
import java.sql.SQLException;

/** Valida la configuración efectiva antes de refrescar el contexto y crear beans JPA. */
public final class PostgresIntegrationSafetyInitializer
        implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final String JDBC_URL = "jdbc:postgresql://127.0.0.1:55433/hu17_verify";

    @Override
    public void initialize(ConfigurableApplicationContext context) {
        ConfigurableEnvironment environment = context.getEnvironment();
        String password = environment.getProperty("HU17_VERIFY_PASSWORD");
        require(java.util.Arrays.asList(environment.getActiveProfiles()).contains("hu17"),
                "Debe activarse el perfil HU-17.");
        require(password != null && !password.isBlank(), "Falta HU17_VERIFY_PASSWORD.");
        require(JDBC_URL.equals(environment.getProperty("SUPABASE_DATASOURCE_URL")),
                "La URL JDBC primaria no corresponde a hu17_verify.");
        require(JDBC_URL.equals(environment.getProperty("SPRING_DATASOURCE_URL")),
                "La URL JDBC fallback no corresponde a hu17_verify.");
        require("hu17_verify".equals(environment.getProperty("SUPABASE_USER")),
                "El usuario primario no está designado para HU-17.");
        require("hu17_verify".equals(environment.getProperty("POSTGRES_USER")),
                "El usuario fallback no está designado para HU-17.");
        require(password.equals(environment.getProperty("SUPABASE_PASSWORD")),
                "La contraseña primaria debe proceder de HU17_VERIFY_PASSWORD.");
        require(password.equals(environment.getProperty("POSTGRES_PASSWORD")),
                "La contraseña fallback debe proceder de HU17_VERIFY_PASSWORD.");
        require("create-drop".equals(environment.getProperty("spring.jpa.hibernate.ddl-auto")),
                "El perfil HU-17 debe usar create-drop exclusivamente en la base aislada.");
        verifyDatabaseIdentity(password);
    }

    private static void verifyDatabaseIdentity(String password) {
        try (var connection = DriverManager.getConnection(JDBC_URL, "hu17_verify", password);
             var statement = connection.createStatement();
             var result = statement.executeQuery("SELECT current_database(), current_user, current_setting('server_version_num')::int")) {
            require(result.next(), "PostgreSQL no devolvió identidad de conexión.");
            require("hu17_verify".equals(result.getString(1)), "La base conectada no es hu17_verify.");
            require("hu17_verify".equals(result.getString(2)), "El rol conectado no es hu17_verify.");
            require(result.getInt(3) >= 170000, "El servidor PostgreSQL no es versión 17 o superior.");
        } catch (SQLException exception) {
            throw new IllegalStateException(
                    "Gate HU-17: no se pudo verificar la identidad de PostgreSQL en el endpoint local designado.");
        }
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException("Gate de seguridad HU-17 rechazó la configuración. " + message);
        }
    }
}
