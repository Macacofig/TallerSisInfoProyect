package com.unihub.backend.exception;

public class CredencialesInvalidasException extends BadRequestException {

    public CredencialesInvalidasException() {
        super("Correo electrónico o contraseña incorrectos");
    }
}