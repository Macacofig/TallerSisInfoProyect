package com.unihub.backend.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SolicitudAyudaTest {

    @Test
    void deberiaInicializarEstadoResueltaConConstructorJpa() {
        SolicitudAyuda solicitud = new SolicitudAyuda();

        assertEquals(SolicitudAyuda.EstadoSolicitudAyuda.RESUELTA, solicitud.getEstado());
    }

    @Test
    void deberiaCrearSolicitudResueltaConConstructorPublico() {
        SolicitudAyuda solicitud = nuevaSolicitud();

        assertEquals(SolicitudAyuda.EstadoSolicitudAyuda.RESUELTA, solicitud.getEstado());
    }

    @Test
    void deberiaResolverUnaSolicitudPendienteExistente() {
        SolicitudAyuda solicitud = nuevaSolicitud();
        solicitud.setEstado(SolicitudAyuda.EstadoSolicitudAyuda.PENDIENTE);

        solicitud.resolver();

        assertEquals(SolicitudAyuda.EstadoSolicitudAyuda.RESUELTA, solicitud.getEstado());
    }

    @Test
    void deberiaCancelarUnaSolicitudResuelta() {
        SolicitudAyuda solicitud = nuevaSolicitud();

        solicitud.cancelar();

        assertEquals(SolicitudAyuda.EstadoSolicitudAyuda.CANCELADA, solicitud.getEstado());
    }

    private SolicitudAyuda nuevaSolicitud() {
        Estudiante estudiante = new Estudiante("Estudiante", "pass", "70000000", "estudiante@test.com", "Sistemas");
        Estudiante estudianteAyudante = new Estudiante("Ayudante", "pass", "71111111", "ayudante@test.com", "Sistemas");
        Materia materia = new Materia("INF101", "Programación I", "Sistemas", 1);
        AyudanteMateria ayudante = new AyudanteMateria(estudianteAyudante, materia, "Lunes 10-12");
        ayudante.aprobar();
        return new SolicitudAyuda(estudiante, ayudante, materia, "Necesito ayuda con el ejercicio 5.");
    }
}
