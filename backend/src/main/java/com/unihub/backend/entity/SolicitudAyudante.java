package com.unihub.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "solicitudes_ayudantes")
public class SolicitudAyudante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud_ayudante")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_materia", nullable = false)
    private Materia materia;

    @Column(name = "motivo", nullable = false, columnDefinition = "TEXT")
    private String motivo;

    @Column(name = "calificacion", nullable = false)
    private Double calificacion;

    @Column(name = "horarios", nullable = false)
    private String horarios;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    protected SolicitudAyudante() {
    }

    public SolicitudAyudante(Estudiante estudiante, Materia materia, String motivo, Double calificacion, String horarios) {
        this.estudiante = estudiante;
        this.materia = materia;
        this.motivo = motivo;
        this.calificacion = calificacion;
        this.horarios = horarios;
        this.estado = EstadoSolicitud.PENDIENTE;
    }

    public Long getId() {
        return id;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public Materia getMateria() {
        return materia;
    }

    public String getMotivo() {
        return motivo;
    }

    public Double getCalificacion() {
        return calificacion;
    }

    public String getHorarios() {
        return horarios;
    }

    public EstadoSolicitud getEstado() {
        return estado;
    }

    public void setEstado(EstadoSolicitud estado) {
        this.estado = estado;
    }

    public void aprobar() {
        this.estado = EstadoSolicitud.APROBADA;
    }

    public void rechazar() {
        this.estado = EstadoSolicitud.RECHAZADA;
    }

    public enum EstadoSolicitud {
        PENDIENTE,
        APROBADA,
        RECHAZADA
    }
}