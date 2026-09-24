package com.unihub.backend.service;

import com.unihub.backend.dto.estudiante.EstudianteLoginRequest;
import com.unihub.backend.dto.estudiante.EstudianteRequest;
import com.unihub.backend.dto.estudiante.EstudianteResponse;
import com.unihub.backend.entity.Estudiante;
import com.unihub.backend.mapper.EstudianteMapper;
import com.unihub.backend.repository.EstudianteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@TestMethodOrder(OrderAnnotation.class)
class EstudianteServiceTest {

    @Mock
    private EstudianteRepository estudianteRepository;

    private EstudianteService estudianteService;
    private static int numeroPrueba;

    @BeforeEach
    void setUp() {
        estudianteService = new EstudianteService(estudianteRepository, new EstudianteMapper());
        numeroPrueba++;
    }

    private void mostrarResultado(String descripcion) {
        System.out.println("-----------------------------");
        System.out.println("PRUEBA " + numeroPrueba);
        System.out.println("-----------------------------");
        System.out.println(descripcion);
        System.out.println("Resultado: OK");
        System.out.println("-----------------------------");
    }

    @Test
    @Order(1)
    void deberiaRegistrarEstudianteNormalizandoEspacios() {
        EstudianteRequest request = new EstudianteRequest(
                "  Ana   Pérez  ",
                "  ClaveSegura1!  ",
                " 71234567 ",
                " ana@ucb.edu.bo ",
                "  Ingeniería   de   Sistemas  "
        );
        when(estudianteRepository.existsByCorreoElectronicoIgnoreCase("ana@ucb.edu.bo")).thenReturn(false);
        when(estudianteRepository.save(any(Estudiante.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        EstudianteResponse resultado = estudianteService.registrar(request);

        assertEquals("Ana Pérez", resultado.nombre());
        assertEquals("71234567", resultado.telefono());
        assertEquals("ana@ucb.edu.bo", resultado.correoElectronico());
        assertEquals("Ingeniería de Sistemas", resultado.carrera());

        ArgumentCaptor<Estudiante> captor = ArgumentCaptor.forClass(Estudiante.class);
        verify(estudianteRepository).save(captor.capture());
        assertEquals("ClaveSegura1!", captor.getValue().getContrasena());
        mostrarResultado("Registrar estudiante normalizando espacios en los campos");
    }

    @Test
    @Order(2)
    void deberiaRechazarCorreoElectronicoDuplicado() {
        EstudianteRequest request = new EstudianteRequest(
                "Ana Pérez", "ClaveSegura1!", "71234567", "ana@ucb.edu.bo", "Ingeniería"
        );
        when(estudianteRepository.existsByCorreoElectronicoIgnoreCase("ana@ucb.edu.bo")).thenReturn(true);

        IllegalArgumentException excepcion = assertThrows(
                IllegalArgumentException.class,
                () -> estudianteService.registrar(request)
        );

        assertEquals("El correo electrónico ya está registrado", excepcion.getMessage());
        verify(estudianteRepository, never()).save(any(Estudiante.class));
        mostrarResultado("Rechazar registro cuando el correo ya está registrado");
    }

    @Test
    @Order(3)
    void deberiaIniciarSesionConCredencialesValidas() {
        Estudiante estudiante = new Estudiante(
                "Ana Pérez",
                "ClaveSegura1!",
                "71234567",
                "ana@ucb.edu.bo",
                "Ingeniería de Sistemas"
        );
        EstudianteLoginRequest request = new EstudianteLoginRequest(
                "  ana@ucb.edu.bo  ",
                "  ClaveSegura1!  "
        );
        when(estudianteRepository.findByCorreoElectronicoIgnoreCase("ana@ucb.edu.bo")).thenReturn(Optional.of(estudiante));

        EstudianteResponse resultado = estudianteService.iniciarSesion(request);

        assertEquals("Ana Pérez", resultado.nombre());
        assertEquals("ana@ucb.edu.bo", resultado.correoElectronico());
        assertEquals("Ingeniería de Sistemas", resultado.carrera());
        mostrarResultado("Iniciar sesión con correo y contraseña válidos");
    }

    @Test
    @Order(4)
    void deberiaRechazarInicioSesionCuandoElCorreoNoExiste() {
        EstudianteLoginRequest request = new EstudianteLoginRequest(
                "noexiste@ucb.edu.bo",
                "ClaveSegura1!"
        );
        when(estudianteRepository.findByCorreoElectronicoIgnoreCase("noexiste@ucb.edu.bo")).thenReturn(Optional.empty());

        IllegalArgumentException excepcion = assertThrows(
                IllegalArgumentException.class,
                () -> estudianteService.iniciarSesion(request)
        );

        assertEquals("Correo electrónico o contraseña incorrectos", excepcion.getMessage());
        mostrarResultado("Rechazar inicio de sesión cuando el correo no existe");
    }

    @Test
    @Order(5)
    void deberiaRechazarInicioSesionCuandoLaContrasenaEsIncorrecta() {
        Estudiante estudiante = new Estudiante(
                "Ana Pérez",
                "ClaveSegura1!",
                "71234567",
                "ana@ucb.edu.bo",
                "Ingeniería de Sistemas"
        );
        EstudianteLoginRequest request = new EstudianteLoginRequest(
                "ana@ucb.edu.bo",
                "OtraClave123!"
        );
        when(estudianteRepository.findByCorreoElectronicoIgnoreCase("ana@ucb.edu.bo")).thenReturn(Optional.of(estudiante));

        IllegalArgumentException excepcion = assertThrows(
                IllegalArgumentException.class,
                () -> estudianteService.iniciarSesion(request)
        );

        assertEquals("Correo electrónico o contraseña incorrectos", excepcion.getMessage());
        mostrarResultado("Rechazar inicio de sesión cuando la contraseña es incorrecta");
    }
}
