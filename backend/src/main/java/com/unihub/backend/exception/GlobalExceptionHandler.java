package com.unihub.backend.exception;

import com.unihub.backend.common.LogHelper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<String> manejarSolicitudInvalida(BadRequestException exception) {
		LogHelper.warn(GlobalExceptionHandler.class, "Solicitud inválida rechazada");
		return ResponseEntity.badRequest().body(exception.getMessage());
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<String> manejarRecursoNoEncontrado(ResourceNotFoundException exception) {
		LogHelper.warn(GlobalExceptionHandler.class, "Recurso solicitado no encontrado");
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exception.getMessage());
	}

	@ExceptionHandler(DocenteInexistenteException.class)
	public ResponseEntity<String> manejarDocenteInexistente(DocenteInexistenteException exception) {
		LogHelper.warn(GlobalExceptionHandler.class, "Solicitud de calificación rechazada: docente inexistente");
		return ResponseEntity.badRequest().body(exception.getMessage());
	}

	@ExceptionHandler(CalificacionDocenteDuplicadaException.class)
	public ResponseEntity<String> manejarCalificacionDuplicada(CalificacionDocenteDuplicadaException exception) {
		LogHelper.warn(GlobalExceptionHandler.class, "Solicitud de calificación duplicada rechazada");
		return ResponseEntity.status(HttpStatus.CONFLICT).body(exception.getMessage());
	}
}
