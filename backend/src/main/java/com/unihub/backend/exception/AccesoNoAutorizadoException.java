package com.unihub.backend.exception;

public class AccesoNoAutorizadoException extends RuntimeException {
    public AccesoNoAutorizadoException() {
        super("No está autorizado para modificar este estudiante");
    }

    public AccesoNoAutorizadoException(String message) {
        super(message);
    }
}
