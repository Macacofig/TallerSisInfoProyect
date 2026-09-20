package com.unihub.backend.exception;

public class DocenteInexistenteException extends IllegalArgumentException {

    public DocenteInexistenteException() {
        super("Este docente no existe");
    }
}
