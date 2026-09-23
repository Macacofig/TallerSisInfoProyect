package com.unihub.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "docentes")
public class Docente {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String nombre;

	@OneToMany(mappedBy = "docente", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private List<DocenteMateria> materias = new ArrayList<>();

	protected Docente() {
	}

	public Docente(String nombre, Materia materia) {
		this.nombre = nombre;
		agregarMateria(materia);
	}

	public Docente(String nombre) {
		this.nombre = nombre;
	}

	public Long getId() {
		return id;
	}

	public String getNombre() {
		return nombre;
	}

	public Materia getMateria() {
		return materias.isEmpty() ? null : materias.get(0).getMateria();
	}

	public List<DocenteMateria> getMaterias() {
		return materias;
	}

	public void agregarMateria(Materia materia) {
		materias.add(new DocenteMateria(this, materia));
	}
}
