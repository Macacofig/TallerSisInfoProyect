package com.unihub.backend.service;

import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.repository.EstudianteRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "unihub.admin.provision.enabled",
        havingValue = "true"
)
public class AdminProvisioningRunner implements ApplicationRunner {

    private final EstudianteRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public AdminProvisioningRunner(
            EstudianteRepository repository,
            PasswordEncoder passwordEncoder,
            Environment environment
    ) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        String correo = requerido("ADMIN_PROVISION_EMAIL")
                .trim().toLowerCase(java.util.Locale.ROOT);
        String contrasena = requerido("ADMIN_PROVISION_PASSWORD");
        String nombre = requerido("ADMIN_PROVISION_NAME");
        String telefono = requerido("ADMIN_PROVISION_PHONE");
        String carrera = requerido("ADMIN_PROVISION_CAREER");

        if (!correo.matches("^[A-Za-z0-9._%+-]+@ucb\\.edu\\.bo$")) {
            throw new IllegalStateException("Correo institucional ADMIN invalido");
        }

        if (contrasena.length() < 12) {
            throw new IllegalStateException(
                    "La contrasena ADMIN debe tener al menos 12 caracteres"
            );
        }

        if (!telefono.matches("^[67]\\d{7}$")) {
            throw new IllegalStateException("Telefono ADMIN invalido");
        }

        if (repository.existsByCorreoElectronicoIgnoreCase(correo)) {
            throw new IllegalStateException(
                    "La cuenta ya existe. No se modificara ni promovera automaticamente."
            );
        }

        Estudiante administrador = new Estudiante(
                nombre,
                passwordEncoder.encode(contrasena),
                telefono,
                correo,
                carrera
        );

        administrador.actualizarRol(Estudiante.Rol.ADMIN);

        repository.saveAndFlush(administrador);

        System.out.println(
                "Provision administrativa completada correctamente."
        );
    }

    private String requerido(String nombre) {
        String valor = environment.getProperty(nombre);

        if (valor == null || valor.isBlank()) {
            throw new IllegalStateException(
                    "Falta la variable requerida: " + nombre
            );
        }

        return valor;
    }
}