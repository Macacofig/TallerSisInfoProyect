package com.unihub.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "notificaciones")
public class Notificacion {
    public enum TipoNotificacion {
        POSTULACION_CREADA, POSTULACION_APROBADA, POSTULACION_RECHAZADA, SOLICITUD_AYUDA_RECIBIDA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private TipoNotificacion tipo;
    @Column(nullable = false, length = 160)
    private String titulo;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;
    @Column(nullable = false)
    private boolean leida = false;
    @Column(name = "fecha_creacion", nullable = false)
    private Instant fechaCreacion = Instant.now();
    @Column(name = "referencia_tipo", length = 40)
    private String referenciaTipo;
    @Column(name = "referencia_id")
    private Long referenciaId;

    protected Notificacion() {}

    public Notificacion(Estudiante estudiante, TipoNotificacion tipo, String titulo, String mensaje,
                        String referenciaTipo, Long referenciaId) {
        this.estudiante = Objects.requireNonNull(estudiante);
        this.tipo = Objects.requireNonNull(tipo);
        if (titulo == null || titulo.isBlank() || titulo.length() > 160
                || mensaje == null || mensaje.isBlank()) {
            throw new IllegalArgumentException("Título y mensaje de notificación inválidos");
        }
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.referenciaTipo = referenciaTipo;
        this.referenciaId = referenciaId;
    }

    public Long getId() { return id; }
    public Estudiante getEstudiante() { return estudiante; }
    public TipoNotificacion getTipo() { return tipo; }
    public String getTitulo() { return titulo; }
    public String getMensaje() { return mensaje; }
    public boolean isLeida() { return leida; }
    public Instant getFechaCreacion() { return fechaCreacion; }
    public String getReferenciaTipo() { return referenciaTipo; }
    public Long getReferenciaId() { return referenciaId; }
    public void marcarComoLeida() { leida = true; }
}
