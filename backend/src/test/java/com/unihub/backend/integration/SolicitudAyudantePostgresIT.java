package com.unihub.backend.integration;

import com.unihub.backend.dto.ayudante.SolicitudAyudanteRequest;
import com.unihub.backend.entity.AyudanteMateria;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.entity.Materia;
import com.unihub.backend.entity.SolicitudAyudante;
import com.unihub.backend.repository.AyudanteMateriaRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.repository.MateriaRepository;
import com.unihub.backend.repository.SolicitudAyudanteRepository;
import com.unihub.backend.service.AyudanteMateriaService;
import com.unihub.backend.service.SolicitudAyudanteService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("integration-postgres")
@ContextConfiguration(initializers = PostgresIntegrationSafetyInitializer.class)
@Transactional
class SolicitudAyudantePostgresIT {

    @Autowired private SolicitudAyudanteService solicitudService;
    @Autowired private AyudanteMateriaService ayudanteService;
    @Autowired private SolicitudAyudanteRepository solicitudRepository;
    @Autowired private AyudanteMateriaRepository ayudanteRepository;
    @Autowired private EstudianteRepository estudianteRepository;
    @Autowired private MateriaRepository materiaRepository;
    @Autowired private EntityManager entityManager;

    @Test
    void aprobacionYRechazoPersistenLaRelacionYRespetanElListadoPorMateria() {
        Materia materia = materia("HU17-A");
        Materia otraMateria = materia("HU17-B");
        Estudiante aprobada = estudiante("aprobado");
        Estudiante rechazada = estudiante("rechazado");
        Estudiante independiente = estudiante("independiente");

        var solicitudAprobada = solicitudService.solicitar(new SolicitudAyudanteRequest(
                aprobada.getId(), materia.getId(), "Interés en apoyar", 9.2, "Lunes 10-12"));
        SolicitudAyudante pendiente = solicitudRepository.findById(solicitudAprobada.id()).orElseThrow();
        assertEquals(SolicitudAyudante.EstadoSolicitud.PENDIENTE, pendiente.getEstado());
        assertNotNull(pendiente.getAyudanteMateria());
        Long idRelacionAprobada = pendiente.getAyudanteMateria().getId();
        entityManager.flush();
        entityManager.clear();

        SolicitudAyudante recargada = solicitudRepository.findById(solicitudAprobada.id()).orElseThrow();
        AyudanteMateria relacionRecargada = ayudanteRepository.findById(idRelacionAprobada).orElseThrow();
        assertEquals(idRelacionAprobada, recargada.getAyudanteMateria().getId());
        assertEquals(AyudanteMateria.EstadoAyudante.PENDIENTE, relacionRecargada.getEstado());
        assertTrue(ayudanteService.obtenerAyudantesAprobadosPorMateria(materia.getId()).stream()
                .noneMatch(a -> a.idEstudiante().equals(aprobada.getId())));

        solicitudService.aprobar(solicitudAprobada.id());
        entityManager.flush();
        entityManager.clear();
        SolicitudAyudante aprobadaPersistida = solicitudRepository.findById(solicitudAprobada.id()).orElseThrow();
        assertEquals(SolicitudAyudante.EstadoSolicitud.APROBADA, aprobadaPersistida.getEstado());
        assertEquals(AyudanteMateria.EstadoAyudante.APROBADO,
                ayudanteRepository.findById(idRelacionAprobada).orElseThrow().getEstado());
        var listadoMateria = ayudanteService.obtenerAyudantesAprobadosPorMateria(materia.getId());
        assertEquals(1, listadoMateria.stream().filter(a -> a.idEstudiante().equals(aprobada.getId())).count());
        assertTrue(listadoMateria.stream().allMatch(a -> a.idMateria().equals(materia.getId())));
        assertThrows(IllegalStateException.class, () -> solicitudService.rechazar(solicitudAprobada.id()));

        var solicitudRechazada = solicitudService.solicitar(new SolicitudAyudanteRequest(
                rechazada.getId(), materia.getId(), "Otra solicitud", 8.4, "Martes 10-12"));
        solicitudService.rechazar(solicitudRechazada.id());
        entityManager.flush();
        entityManager.clear();
        SolicitudAyudante rechazoPersistido = solicitudRepository.findById(solicitudRechazada.id()).orElseThrow();
        assertEquals(SolicitudAyudante.EstadoSolicitud.RECHAZADA, rechazoPersistido.getEstado());
        assertEquals(AyudanteMateria.EstadoAyudante.RECHAZADO,
                ayudanteRepository.findById(rechazoPersistido.getAyudanteMateria().getId()).orElseThrow().getEstado());
        assertTrue(ayudanteService.obtenerAyudantesAprobadosPorMateria(materia.getId()).stream()
                .noneMatch(a -> a.idEstudiante().equals(rechazada.getId())));

        ayudanteService.crear(new com.unihub.backend.dto.ayudante.AyudanteMateriaRequest(
                independiente.getId(), otraMateria.getId(), "Viernes 14-16"));
        var otroListado = ayudanteService.obtenerAyudantesAprobadosPorMateria(otraMateria.getId());
        assertEquals(1, otroListado.size());
        assertEquals(independiente.getId(), otroListado.get(0).idEstudiante());
        assertEquals(AyudanteMateria.EstadoAyudante.APROBADO,
                ayudanteRepository.findById(otroListado.get(0).id()).orElseThrow().getEstado());
        assertEquals(2, solicitudRepository.findByMateriaId(materia.getId()).size());
    }

    private Materia materia(String sufijo) {
        return materiaRepository.saveAndFlush(new Materia(
                sufijo + "-" + UUID.randomUUID().toString().substring(0, 8), "Materia HU17", "Ingeniería", 2));
    }

    private Estudiante estudiante(String sufijo) {
        String id = UUID.randomUUID().toString().substring(0, 8);
        return estudianteRepository.saveAndFlush(new Estudiante(
                "HU17 " + sufijo, "test-only", "70000000", "hu17-" + sufijo + "-" + id + "@example.test", "Ingeniería"));
    }
}
