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
		uniqueConstraints = @UniqueConstraint(columnNames = {"id_estudiante", "id_docente"})
)
public class CalificacionDocente {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "id_docente", nullable = false)
	private Docente docente;

	@Column(name = "id_estudiante")
	private Long idEstudiante;

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
			Long idEstudiante,
			Integer claridadExplicaciones,
			Integer metodologia,
			Integer relacionClasesEvaluaciones,
			String gestion
	) {
		this.docente = docente;
		this.idEstudiante = idEstudiante;
		this.claridadExplicaciones = claridadExplicaciones;
		this.metodologia = metodologia;
		this.relacionClasesEvaluaciones = relacionClasesEvaluaciones;
		this.gestion = gestion;
	}

	public Long getId() { return id; }
	public Docente getDocente() { return docente; }
	public Long getIdEstudiante() { return idEstudiante; }
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
