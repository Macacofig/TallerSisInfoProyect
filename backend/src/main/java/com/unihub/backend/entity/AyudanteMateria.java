package com.unihub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "ayudante_materia")
public class AyudanteMateria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_materia", nullable = false)
    private Materia materia;

    @Column(name = "horario", nullable = false)
    private String horario;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoAyudante estado = EstadoAyudante.PENDIENTE;

    protected AyudanteMateria() {
    }

    public AyudanteMateria(Estudiante estudiante, Materia materia, String horario) {
        this.estudiante = estudiante;
        this.materia = materia;
        this.horario = horario;
        this.estado = EstadoAyudante.APROBADO;
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

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public EstadoAyudante getEstado() {
        return estado;
    }

    public void setEstado(EstadoAyudante estado) {
        this.estado = estado;
    }

    public void aprobar() {
        this.estado = EstadoAyudante.APROBADO;
    }

    public void rechazar() {
        this.estado = EstadoAyudante.RECHAZADO;
    }

    public void dejarDeSerAyudante() {
        this.estado = EstadoAyudante.INACTIVO;
    }

    public enum EstadoAyudante {
        PENDIENTE,
        APROBADO,
        RECHAZADO,
        INACTIVO
    }
}