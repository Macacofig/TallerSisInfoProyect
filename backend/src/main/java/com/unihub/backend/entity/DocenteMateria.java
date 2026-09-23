package com.unihub.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "docente_materia", uniqueConstraints = @UniqueConstraint(columnNames = {"id_docente", "id_materia"}))
public class DocenteMateria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_docente", nullable = false)
    private Docente docente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_materia", nullable = false)
    private Materia materia;

    protected DocenteMateria() {
    }

    public DocenteMateria(Docente docente, Materia materia) {
        this.docente = docente;
        this.materia = materia;
    }

    public Materia getMateria() {
        return materia;
    }

    public Long getId() {
        return id;
    }

    public Docente getDocente() {
        return docente;
    }
}