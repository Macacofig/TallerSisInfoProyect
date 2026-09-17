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

@Entity
@Table(name = "calificacionMateria")
public class CalificacionMateria {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "id_materia", nullable = false)
	private Materia materia;

	// Cuando exista Estudiante, reemplazar este campo por @ManyToOne y @JoinColumn(name = "id_estudiante").
	@Column(name = "id_estudiante")
	private Long idEstudiante;

	@Column(nullable = false)
	private Integer dificultad;

	@Column(nullable = false)
	private Integer carga;

	@Column(nullable = false)
	private Integer conocimientoPrevio;

	@Column(nullable = false)
	private String prerequisitosText;

	@Column(nullable = false)
	private String predominio;

	@Column(nullable = false)
	private String gestion;

	protected CalificacionMateria() {
	}

	public CalificacionMateria(
			Materia materia,
			Long idEstudiante,
			Integer dificultad,
			Integer carga,
			Integer conocimientoPrevio,
			String prerequisitosText,
			String predominio,
			String gestion
	) {
		this.materia = materia;
		this.idEstudiante = idEstudiante;
		this.dificultad = dificultad;
		this.carga = carga;
		this.conocimientoPrevio = conocimientoPrevio;
		this.prerequisitosText = prerequisitosText;
		this.predominio = predominio;
		this.gestion = gestion;
	}

	public Long getId() {
		return id;
	}

	public Materia getMateria() {
		return materia;
	}

	public Long getIdEstudiante() {
		return idEstudiante;
	}

	public Integer getDificultad() {
		return dificultad;
	}

	public Integer getCarga() {
		return carga;
	}

	public Integer getConocimientoPrevio() {
		return conocimientoPrevio;
	}

	public String getPrerequisitosText() {
		return prerequisitosText;
	}

	public String getPredominio() {
		return predominio;
	}

	public String getGestion() {
		return gestion;
	}

	public void actualizar(
			Integer dificultad,
			Integer carga,
			Integer conocimientoPrevio,
			String prerequisitosText,
			String predominio,
			String gestion
	) {
		this.dificultad = dificultad;
		this.carga = carga;
		this.conocimientoPrevio = conocimientoPrevio;
		this.prerequisitosText = prerequisitosText;
		this.predominio = predominio;
		this.gestion = gestion;
	}
}
