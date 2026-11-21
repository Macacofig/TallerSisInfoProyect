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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "solicitudes_material")
public class SolicitudMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud_material")
    private Long id;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material", nullable = true, unique = true)
    private Material material;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoSolicitudMaterial estado = EstadoSolicitudMaterial.PENDIENTE;

    protected SolicitudMaterial() {
    }

    public SolicitudMaterial(String titulo, Estudiante estudiante, Material material) {
        this.titulo = titulo;
        this.estudiante = estudiante;
        this.material = material;
        this.estado = EstadoSolicitudMaterial.PENDIENTE;
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public Material getMaterial() {
        return material;
    }

    public EstadoSolicitudMaterial getEstado() {
        return estado;
    }

    public void desvincularMaterial() {
        this.material = null;
    }

    public void aprobar() {
        exigirPendiente();
        this.estado = EstadoSolicitudMaterial.APROBADO;
    }

    public void negar() {
        exigirPendiente();
        this.estado = EstadoSolicitudMaterial.NEGADO;
    }

    private void exigirPendiente() {
        if (estado != EstadoSolicitudMaterial.PENDIENTE) {
            throw new IllegalStateException("Solo se puede decidir una solicitud pendiente");
        }
    }

    public enum EstadoSolicitudMaterial {
        PENDIENTE,
        APROBADO,
        NEGADO
    }
}
