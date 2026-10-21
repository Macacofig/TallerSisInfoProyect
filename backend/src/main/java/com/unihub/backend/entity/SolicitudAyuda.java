package com.unihub.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "solicitudes_ayuda")
public class SolicitudAyuda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud_ayuda")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_ayudante", nullable = false)
    private AyudanteMateria ayudante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_materia", nullable = false)
    private Materia materia;

    @Column(name = "peticion", nullable = false, columnDefinition = "TEXT")
    private String peticion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoSolicitudAyuda estado = EstadoSolicitudAyuda.PENDIENTE;

    protected SolicitudAyuda() {
    }

    public SolicitudAyuda(Estudiante estudiante, AyudanteMateria ayudante, Materia materia, String peticion) {
        this.estudiante = estudiante;
        this.ayudante = ayudante;
        this.materia = materia;
        this.peticion = peticion;
        this.estado = EstadoSolicitudAyuda.PENDIENTE;
    }

    public Long getId() {
        return id;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public AyudanteMateria getAyudante() {
        return ayudante;
    }

    public Materia getMateria() {
        return materia;
    }

    public String getPeticion() {
        return peticion;
    }

    public EstadoSolicitudAyuda getEstado() {
        return estado;
    }

    public void setEstado(EstadoSolicitudAyuda estado) {
        this.estado = estado;
    }

    public void resolver() {
        this.estado = EstadoSolicitudAyuda.RESUELTA;
    }

    public void cancelar() {
        this.estado = EstadoSolicitudAyuda.CANCELADA;
    }

    public enum EstadoSolicitudAyuda {
        PENDIENTE,
        RESUELTA,
        CANCELADA
    }
}