package com.unihub.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "estudiantes")
public class Estudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String contrasena;

    @Column(nullable = false)
    private String telefono;

    @Column(nullable = false, unique = true)
    private String correoElectronico;

    @Column(nullable = false)
    private String carrera;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Rol rol = Rol.STUDENT;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "materias_aprobadas", nullable = false, columnDefinition = "text[]")
    private List<String> materiasAprobadas = new ArrayList<>();

    protected Estudiante() {
    }

    public Estudiante(
            String nombre,
            String contrasena,
            String telefono,
            String correoElectronico,
            String carrera
    ) {
        this.nombre = nombre;
        this.contrasena = contrasena;
        this.telefono = telefono;
        this.correoElectronico = correoElectronico;
        this.carrera = carrera;
    }

    public enum Rol { STUDENT, ADMIN }
    public Rol getRol() { return rol == null ? Rol.STUDENT : rol; }
    public void actualizarRol(Rol nuevoRol) {
        this.rol = java.util.Objects.requireNonNull(nuevoRol);
    }
    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void actualizarContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getCorreoElectronico() {
        return correoElectronico;
    }

    public String getCarrera() {
        return carrera;
    }

    public List<String> getMateriasAprobadas() {
        return materiasAprobadas;
    }

    public void agregarMateriasAprobadas(List<String> materias) {
        if (materias == null) {
            return;
        }
        if (this.materiasAprobadas == null) {
            this.materiasAprobadas = new ArrayList<>();
        }
        for (String materia : materias) {
            if (materia != null && !materia.isBlank() && !this.materiasAprobadas.contains(materia)) {
                this.materiasAprobadas.add(materia);
            }
        }
    }

    public void actualizar(
            String nombre,
            String telefono,
            String carrera
    ) {
        this.nombre = nombre;
        this.telefono = telefono;
        this.carrera = carrera;
    }
}
