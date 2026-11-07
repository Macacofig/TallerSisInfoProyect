package com.unihub.backend.integration;

import com.unihub.backend.entity.*;
import com.unihub.backend.repository.*;
import com.unihub.backend.mapper.*;
import com.unihub.backend.service.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.*;
import java.util.UUID;

/** Opt-in, loopback-only, dedicated disposable database. Never loads DatabaseConfiguration. */
@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:postgresql://127.0.0.1:55439/hu19_verify",
        "spring.datasource.username=hu19_verify",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = NotificacionPostgresSupport.Config.class)
@EnabledIfEnvironmentVariable(named = "HU19_POSTGRES_TESTS", matches = "true")
public abstract class NotificacionPostgresSupport {
    @Configuration(proxyBeanMethods = false)
    @EntityScan(basePackageClasses = Estudiante.class)
    @EnableJpaRepositories(basePackageClasses = NotificacionRepository.class)
    @Import({NotificacionService.class, NotificacionMapper.class, SolicitudAyudanteService.class,
            SolicitudAyudanteMapper.class, AyudanteMateriaService.class, AyudanteMateriaMapper.class,
            SolicitudAyudaService.class, SolicitudAyudaMapper.class})
    static class Config {}

    @Autowired protected NotificacionRepository notificaciones;
    @Autowired protected EstudianteRepository estudiantes;
    @Autowired protected MateriaRepository materias;
    @Autowired protected NotificacionService servicio;
    @Autowired protected SolicitudAyudanteService postulaciones;
    @Autowired protected SolicitudAyudaService ayudas;
    @Autowired protected AyudanteMateriaService ayudantes;
    @Autowired protected AyudanteMateriaRepository relaciones;
    @Autowired protected SolicitudAyudanteRepository solicitudes;
    @Autowired protected jakarta.persistence.EntityManager em;

    protected Estudiante estudiante() {
        return estudiantes.saveAndFlush(new Estudiante("HU19", "pass", "70000000", UUID.randomUUID()+"@test.local", "Sistemas"));
    }
    protected Materia materia() {
        return materias.saveAndFlush(new Materia(UUID.randomUUID().toString(), "Materia HU19", "Sistemas", 1));
    }
}
