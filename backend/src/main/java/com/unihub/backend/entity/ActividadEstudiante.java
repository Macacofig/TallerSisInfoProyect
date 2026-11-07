package com.unihub.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "actividad_estudiante")
public class ActividadEstudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_hora_registro", nullable = false)
    private LocalDateTime fechaHoraRegistro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private EstadoActividad estado;

    protected ActividadEstudiante() {
    }

    public ActividadEstudiante(
            Estudiante estudiante,
            String titulo,
            String descripcion,
            LocalDateTime fechaHoraRegistro,
            EstadoActividad estado
    ) {
        this.estudiante = estudiante;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaHoraRegistro = fechaHoraRegistro;
        this.estado = estado == null ? EstadoActividad.REALIZADO : estado;
    }

    public Long getId() {
        return id;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public LocalDateTime getFechaHoraRegistro() {
        return fechaHoraRegistro;
    }

    public EstadoActividad getEstado() {
        return estado;
    }

    public void actualizar(String titulo, String descripcion, EstadoActividad estado) {
        if (titulo != null) {
            this.titulo = titulo;
        }
        if (descripcion != null) {
            this.descripcion = descripcion;
        }
        if (estado != null) {
            this.estado = estado;
        }
    }

    public void actualizarEstado(EstadoActividad estado) {
        this.estado = estado;
    }

    public enum EstadoActividad {
        PENDIENTE,
        APROBADA,
        RECHAZADA,
        REALIZADO
    }
}
