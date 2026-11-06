package com.unihub.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

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
