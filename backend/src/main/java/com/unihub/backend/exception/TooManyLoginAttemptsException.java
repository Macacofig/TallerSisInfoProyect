package com.unihub.backend.exception;

public class TooManyLoginAttemptsException extends RuntimeException {
    public TooManyLoginAttemptsException() {
        super("Demasiados intentos de inicio de sesión. Inténtalo más tarde.");
    }
}
