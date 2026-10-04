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
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "calificacionDocente",
		uniqueConstraints = @UniqueConstraint(columnNames = {"id_estudiante", "id_docente", "id_materia"})
)
public class CalificacionDocente {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "id_docente", nullable = false)
	private Docente docente;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "id_materia", nullable = false)
	private Materia materia;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_estudiante")
	private Estudiante estudiante;

	@Column(nullable = false)
	private Integer claridadExplicaciones;

	@Column(nullable = false)
	private Integer metodologia;

	@Column(nullable = false)
	private Integer relacionClasesEvaluaciones;

	@Column(nullable = false)
	private String gestion;

	protected CalificacionDocente() {
	}

	public CalificacionDocente(
			Docente docente,
			Materia materia,
			Estudiante estudiante,
			Integer claridadExplicaciones,
			Integer metodologia,
			Integer relacionClasesEvaluaciones,
			String gestion
	) {
		this.docente = docente;
		this.materia = materia;
		this.estudiante = estudiante;
		this.claridadExplicaciones = claridadExplicaciones;
		this.metodologia = metodologia;
		this.relacionClasesEvaluaciones = relacionClasesEvaluaciones;
		this.gestion = gestion;
	}

	public CalificacionDocente(
			Docente docente,
			Estudiante estudiante,
			Integer claridadExplicaciones,
			Integer metodologia,
			Integer relacionClasesEvaluaciones,
			String gestion
	) {
		this(docente, docente.getMateria(), estudiante, claridadExplicaciones, metodologia,
				relacionClasesEvaluaciones, gestion);
	}

	public Long getId() { return id; }
	public Docente getDocente() { return docente; }
	public Materia getMateria() { return materia; }
	public Estudiante getEstudiante() { return estudiante; }
	public Long getIdEstudiante() { return estudiante == null ? null : estudiante.getId(); }
	public Integer getClaridadExplicaciones() { return claridadExplicaciones; }
	public Integer getMetodologia() { return metodologia; }
	public Integer getRelacionClasesEvaluaciones() { return relacionClasesEvaluaciones; }
	public String getGestion() { return gestion; }

	public void actualizar(
			Integer claridadExplicaciones,
			Integer metodologia,
			Integer relacionClasesEvaluaciones,
			String gestion
	) {
		this.claridadExplicaciones = claridadExplicaciones;
		this.metodologia = metodologia;
		this.relacionClasesEvaluaciones = relacionClasesEvaluaciones;
		this.gestion = gestion;
	}
}
