package com.unihub.backend.exception;

public class CalificacionDocenteDuplicadaException extends IllegalArgumentException {

    public CalificacionDocenteDuplicadaException() {
        super("Ya calificaste a este docente");
    }
}
