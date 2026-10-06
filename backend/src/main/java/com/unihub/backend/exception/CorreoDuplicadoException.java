package com.unihub.backend.exception;

public class CorreoDuplicadoException extends RuntimeException {

    private final String correoElectronico;

    public CorreoDuplicadoException(String correoElectronico) {
        super("El correo ya ha sido registrado");
        this.correoElectronico = correoElectronico;
    }

    public String correoElectronico() {
        return correoElectronico;
    }
}