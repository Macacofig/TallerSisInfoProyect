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

@Entity
@Table(name = "material")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "link_material", nullable = false, columnDefinition = "TEXT")
    private String linkMaterial;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoMaterial tipo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_materia", nullable = false)
    private Materia materia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_docente", nullable = false)
    private Docente docente;

    @Column(name = "semestre_ingresado")
    private Integer semestreIngresado;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoMaterial estado = EstadoMaterial.PENDIENTE;

    protected Material() {
    }

    public Material(
            String linkMaterial,
            String titulo,
            String descripcion,
            TipoMaterial tipo,
            Materia materia,
            Docente docente,
            Integer semestreIngresado
    ) {
        this.linkMaterial = linkMaterial;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.materia = materia;
        this.docente = docente;
        this.semestreIngresado = semestreIngresado;
        this.estado = EstadoMaterial.PENDIENTE;
    }

    public Long getId() {
        return id;
    }

    public String getLinkMaterial() {
        return linkMaterial;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public TipoMaterial getTipo() {
        return tipo;
    }

    public Materia getMateria() {
        return materia;
    }

    public Docente getDocente() {
        return docente;
    }

    public Integer getSemestreIngresado() {
        return semestreIngresado;
    }

    public EstadoMaterial getEstado() {
        return estado;
    }

    public void activar() {
        exigirPendiente();
        this.estado = EstadoMaterial.ACTIVO;
    }

    public void rechazar() {
        exigirPendiente();
        this.estado = EstadoMaterial.RECHAZADO;
    }

    private void exigirPendiente() {
        if (estado != EstadoMaterial.PENDIENTE) {
            throw new IllegalStateException("Solo se puede decidir un material pendiente");
        }
    }

    public enum TipoMaterial {
        IMAGEN,
        WORD,
        PDF,
        POWERPOINT
    }

    public enum EstadoMaterial {
        PENDIENTE,
        ACTIVO,
        RECHAZADO
    }
}
