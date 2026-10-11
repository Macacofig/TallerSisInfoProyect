package com.unihub.backend.service;

import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.repository.EstudianteRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.unihub.backend.common.LogHelper;

import java.util.ArrayList;
import java.util.List;

@Component
public class LegacyPasswordMigrationRunner implements ApplicationRunner {

    private static final String BCRYPT_PATTERN = "\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}";

    private final EstudianteRepository estudianteRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;

    public LegacyPasswordMigrationRunner(
            EstudianteRepository estudianteRepository,
            PasswordEncoder passwordEncoder,
            @Value("${PASSWORD_LEGACY_MIGRATION_ENABLED:false}") boolean enabled
    ) {
        this.estudianteRepository = estudianteRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        List<Estudiante> migrated = new ArrayList<>();
        for (Estudiante estudiante : estudianteRepository.findAll()) {
            String storedPassword = estudiante.getContrasena();
            if (!isBcryptHash(storedPassword)) {
                estudiante.actualizarContrasena(passwordEncoder.encode(storedPassword));
                migrated.add(estudiante);
            }
        }

        if (!migrated.isEmpty()) {
            estudianteRepository.saveAll(migrated);
        }
        LogHelper.info(LegacyPasswordMigrationRunner.class,
                migrated.size() + " legacy passwords migrated");
    }

    private boolean isBcryptHash(String value) {
        return value != null && value.matches(BCRYPT_PATTERN);
    }
}
