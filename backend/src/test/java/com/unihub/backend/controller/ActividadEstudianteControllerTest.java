package com.unihub.backend.controller;

import com.unihub.backend.config.JwtAuthenticationConfig;
import com.unihub.backend.config.JwtAuthenticationInterceptor;
import com.unihub.backend.entity.ActividadEstudiante;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.mapper.ActividadEstudianteMapper;
import com.unihub.backend.repository.ActividadEstudianteRepository;
import com.unihub.backend.repository.EstudianteRepository;
import com.unihub.backend.service.ActividadEstudianteService;
import com.unihub.backend.service.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ActividadEstudianteController.class)
@Import({JwtAuthenticationConfig.class, JwtAuthenticationInterceptor.class, JwtService.class,
        ActividadEstudianteService.class, ActividadEstudianteMapper.class})
@TestPropertySource(properties = "app.security.jwt-middleware.enabled=true")
class ActividadEstudianteControllerTest {

    private static final long USUARIO_A = 41L;
    private static final long USUARIO_B = 73L;
    private static final long ACTIVIDAD_ID = 501L;
    private static final String TEST_SECRET = UUID.randomUUID().toString();
    private static final LocalDateTime FECHA = LocalDateTime.of(2026, 11, 7, 10, 30);
    private static final String ACTUALIZACION = """
            {"titulo":"Título nuevo","descripcion":"Descripción nueva","estado":"APROBADA"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private ActividadEstudianteRepository actividadRepository;

    @MockitoBean
    private EstudianteRepository estudianteRepository;

    @DynamicPropertySource
    static void configurarJwt(DynamicPropertyRegistry registry) {
        registry.add("app.jwt.secret", () -> TEST_SECRET);
        registry.add("app.jwt.expiration-seconds", () -> 3600);
    }

    @ParameterizedTest
    @ValueSource(strings = {"ausente", "malformado", "firma-ajena", "vencido"})
    void todasLasRutasRechazanCredencialesInvalidas(String caso) throws Exception {
        String token = switch (caso) {
            case "firma-ajena" -> new JwtService(UUID.randomUUID().toString(), 3600)
                    .generarToken(estudiante(USUARIO_A));
            case "vencido" -> Jwts.builder()
                    .subject("usuario-a@test.invalid")
                    .claim("studentId", USUARIO_A)
                    .issuedAt(Date.from(Instant.now().minusSeconds(120)))
                    .expiration(Date.from(Instant.now().minusSeconds(60)))
                    .signWith(Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8)))
                    .compact();
            default -> "invalido";
        };
        List<MockHttpServletRequestBuilder> requests = List.of(
                get("/api/actividad-estudiante/estudiante/" + USUARIO_A),
                post("/api/actividad-estudiante").contentType(MediaType.APPLICATION_JSON)
                        .content(insercion(USUARIO_A)),
                put("/api/actividad-estudiante/" + ACTIVIDAD_ID).contentType(MediaType.APPLICATION_JSON)
                        .content(ACTUALIZACION));

        for (var request : requests) {
            if (!caso.equals("ausente")) {
                request.header("Authorization", "Bearer " + token);
            }
            mockMvc.perform(request).andExpect(status().isUnauthorized());
        }
        verifyNoInteractions(actividadRepository, estudianteRepository);
    }

    @Test
    void usuarioConsultaSuActividad() throws Exception {
        when(estudianteRepository.existsById(USUARIO_A)).thenReturn(true);
        when(actividadRepository.findByEstudianteIdOrderByFechaHoraRegistroDesc(USUARIO_A))
                .thenReturn(List.of(actividad(USUARIO_A)));

        mockMvc.perform(get("/api/actividad-estudiante/estudiante/" + USUARIO_A)
                        .header("Authorization", token(USUARIO_A)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(ACTIVIDAD_ID))
                .andExpect(jsonPath("$[0].idEstudiante").value(USUARIO_A))
                .andExpect(jsonPath("$[0].titulo").value("Título original"))
                .andExpect(jsonPath("$[0].descripcion").value("Descripción original"))
                .andExpect(jsonPath("$[0].fechaHoraRegistro").value("2026-11-07T10:30:00"))
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));
    }

    @Test
    void consultaPropiaSinActividadDevuelveListaVacia() throws Exception {
        when(estudianteRepository.existsById(USUARIO_A)).thenReturn(true);
        when(actividadRepository.findByEstudianteIdOrderByFechaHoraRegistroDesc(USUARIO_A))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/actividad-estudiante/estudiante/" + USUARIO_A)
                        .header("Authorization", token(USUARIO_A)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void usuarioNoPuedeConsultarActividadAjena() throws Exception {
        mockMvc.perform(get("/api/actividad-estudiante/estudiante/" + USUARIO_B)
                        .header("Authorization", token(USUARIO_A)))
                .andExpect(status().isForbidden());

        verifyNoInteractions(actividadRepository, estudianteRepository);
    }

    @Test
    void usuarioPuedeInsertarActividadPropia() throws Exception {
        when(estudianteRepository.findById(USUARIO_A)).thenReturn(Optional.of(estudiante(USUARIO_A)));
        when(actividadRepository.save(any(ActividadEstudiante.class))).thenAnswer(invocation -> {
            ActividadEstudiante actividad = invocation.getArgument(0);
            ReflectionTestUtils.setField(actividad, "id", ACTIVIDAD_ID);
            return actividad;
        });

        mockMvc.perform(post("/api/actividad-estudiante")
                        .header("Authorization", token(USUARIO_A))
                        .contentType(MediaType.APPLICATION_JSON).content(insercion(USUARIO_A)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(ACTIVIDAD_ID))
                .andExpect(jsonPath("$.idEstudiante").value(USUARIO_A))
                .andExpect(jsonPath("$.estado").value("REALIZADO"));

        verify(actividadRepository).save(any(ActividadEstudiante.class));
    }

    @Test
    void usuarioNoPuedeInsertarParaOtroEstudiante() throws Exception {
        mockMvc.perform(post("/api/actividad-estudiante")
                        .header("Authorization", token(USUARIO_A))
                        .contentType(MediaType.APPLICATION_JSON).content(insercion(USUARIO_B)))
                .andExpect(status().isForbidden());

        verifyNoInteractions(actividadRepository, estudianteRepository);
    }

    @Test
    void usuarioPuedeActualizarActividadPropiaConIdDistintoAlUsuario() throws Exception {
        ActividadEstudiante actividad = actividad(USUARIO_A);
        when(actividadRepository.findById(ACTIVIDAD_ID)).thenReturn(Optional.of(actividad));
        when(actividadRepository.save(actividad)).thenReturn(actividad);

        mockMvc.perform(put("/api/actividad-estudiante/" + ACTIVIDAD_ID)
                        .header("Authorization", token(USUARIO_A))
                        .contentType(MediaType.APPLICATION_JSON).content(ACTUALIZACION))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ACTIVIDAD_ID))
                .andExpect(jsonPath("$.idEstudiante").value(USUARIO_A))
                .andExpect(jsonPath("$.titulo").value("Título nuevo"))
                .andExpect(jsonPath("$.estado").value("APROBADA"));

        verify(actividadRepository).save(actividad);
    }

    @Test
    void usuarioNoPuedeModificarNiGuardarActividadAjena() throws Exception {
        comprobarActualizacionAjenaRechazada(token(USUARIO_A));
    }

    @Test
    void administradorTampocoPuedeModificarActividadAjena() throws Exception {
        Estudiante administrador = estudiante(USUARIO_A);
        administrador.actualizarRol(Estudiante.Rol.ADMIN);
        comprobarActualizacionAjenaRechazada("Bearer " + jwtService.generarToken(administrador));
    }

    @Test
    void devuelve404CuandoLaActividadNoExiste() throws Exception {
        mockMvc.perform(put("/api/actividad-estudiante/" + ACTIVIDAD_ID)
                        .header("Authorization", token(USUARIO_A))
                        .contentType(MediaType.APPLICATION_JSON).content(ACTUALIZACION))
                .andExpect(status().isNotFound());

        verify(actividadRepository, never()).save(any(ActividadEstudiante.class));
    }

    @Test
    void devuelve404CuandoElEstudiantePropioNoExiste() throws Exception {
        mockMvc.perform(get("/api/actividad-estudiante/estudiante/" + USUARIO_A)
                        .header("Authorization", token(USUARIO_A)))
                .andExpect(status().isNotFound());
    }

    @Test
    void rechazaActividadSinTitulo() throws Exception {
        mockMvc.perform(post("/api/actividad-estudiante")
                        .header("Authorization", token(USUARIO_A))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idEstudiante":41,"titulo":"","descripcion":"Descripción"}
                                """))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(actividadRepository, estudianteRepository);
    }

    private void comprobarActualizacionAjenaRechazada(String token) throws Exception {
        ActividadEstudiante actividad = actividad(USUARIO_B);
        when(actividadRepository.findById(ACTIVIDAD_ID)).thenReturn(Optional.of(actividad));

        mockMvc.perform(put("/api/actividad-estudiante/" + ACTIVIDAD_ID)
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(ACTUALIZACION))
                .andExpect(status().isForbidden());

        assertEquals("Título original", actividad.getTitulo());
        assertEquals("Descripción original", actividad.getDescripcion());
        assertEquals(ActividadEstudiante.EstadoActividad.PENDIENTE, actividad.getEstado());
        assertEquals(FECHA, actividad.getFechaHoraRegistro());
        verify(actividadRepository, never()).save(any(ActividadEstudiante.class));
    }

    private String token(long estudianteId) {
        return "Bearer " + jwtService.generarToken(estudiante(estudianteId));
    }

    private Estudiante estudiante(long id) {
        Estudiante estudiante = new Estudiante(
                "Estudiante " + id, "pass", "70000000", "estudiante" + id + "@test.invalid", "Sistemas");
        ReflectionTestUtils.setField(estudiante, "id", id);
        return estudiante;
    }

    private ActividadEstudiante actividad(long propietarioId) {
        ActividadEstudiante actividad = new ActividadEstudiante(
                estudiante(propietarioId), "Título original", "Descripción original", FECHA,
                ActividadEstudiante.EstadoActividad.PENDIENTE);
        ReflectionTestUtils.setField(actividad, "id", ACTIVIDAD_ID);
        return actividad;
    }

    private String insercion(long estudianteId) {
        return """
                {"idEstudiante":%d,"titulo":"Calificar materia","descripcion":"Calificación a materia","estado":"REALIZADO"}
                """.formatted(estudianteId);
    }
}
