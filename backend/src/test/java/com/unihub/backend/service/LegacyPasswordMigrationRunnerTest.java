package com.unihub.backend.service;

import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.repository.EstudianteRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LegacyPasswordMigrationRunnerTest {

    private final EstudianteRepository repository = mock(EstudianteRepository.class);
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void migratesOnlyLegacyPasswordsAndKeepsBcryptUnchanged() throws Exception {
        Estudiante legacy = estudiante("plain-password");
        String existingHash = passwordEncoder.encode("already-hashed-password");
        Estudiante hashed = estudiante(existingHash);
        when(repository.findAll()).thenReturn(List.of(legacy, hashed));

        runner(true).run(new DefaultApplicationArguments(new String[0]));

        assertTrue(passwordEncoder.matches("plain-password", legacy.getContrasena()));
        assertEquals(existingHash, hashed.getContrasena());
        verify(repository).saveAll(List.of(legacy));
    }

    @Test
    void disabledMigrationDoesNotReadOrPersistStudents() throws Exception {
        runner(false).run(new DefaultApplicationArguments(new String[0]));

        verify(repository, never()).findAll();
        verify(repository, never()).saveAll(org.mockito.ArgumentMatchers.anyIterable());
    }

    @Test
    void secondRunDoesNotChangeAlreadyMigratedPassword() throws Exception {
        Estudiante student = estudiante("plain-password");
        when(repository.findAll()).thenReturn(List.of(student));
        LegacyPasswordMigrationRunner migration = runner(true);

        migration.run(new DefaultApplicationArguments(new String[0]));
        String migratedHash = student.getContrasena();
        migration.run(new DefaultApplicationArguments(new String[0]));

        assertEquals(migratedHash, student.getContrasena());
        assertTrue(passwordEncoder.matches("plain-password", migratedHash));
        verify(repository).saveAll(List.of(student));
    }

    private LegacyPasswordMigrationRunner runner(boolean enabled) {
        return new LegacyPasswordMigrationRunner(repository, passwordEncoder, enabled);
    }

    private Estudiante estudiante(String password) {
        return new Estudiante("Student", password, "00000000", "student@example.test", "Systems");
    }
}
