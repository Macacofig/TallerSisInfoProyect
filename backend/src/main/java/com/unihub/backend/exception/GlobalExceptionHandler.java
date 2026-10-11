package com.unihub.backend.exception;

import com.unihub.backend.common.LogHelper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(CorreoDuplicadoException.class)
	public ResponseEntity<String> manejarCorreoDuplicado(CorreoDuplicadoException exception) {
		LogHelper.warn(GlobalExceptionHandler.class, "Registro rechazado por correo duplicado");
		return ResponseEntity.status(HttpStatus.CONFLICT).body(exception.getMessage());
	}

	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<String> manejarSolicitudInvalida(BadRequestException exception) {
		LogHelper.warn(GlobalExceptionHandler.class, "Solicitud inválida rechazada");
		return ResponseEntity.badRequest().body(exception.getMessage());
	}

	@ExceptionHandler(CredencialesInvalidasException.class)
	public ResponseEntity<String> manejarCredencialesInvalidas(CredencialesInvalidasException exception) {
		LogHelper.error(GlobalExceptionHandler.class, "Inicio de sesión rechazado por credenciales inválidas", null);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(exception.getMessage());
	}

	@ExceptionHandler(AccesoNoAutorizadoException.class)
	public ResponseEntity<String> manejarAccesoNoAutorizado(AccesoNoAutorizadoException exception) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(exception.getMessage());
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

	@ExceptionHandler(TooManyLoginAttemptsException.class)
	public ResponseEntity<String> manejarDemasiadosIntentos(TooManyLoginAttemptsException exception) {
		return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(exception.getMessage());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<String> manejarValidacionInvalida(MethodArgumentNotValidException exception) {
		return ResponseEntity.badRequest().body("La solicitud contiene datos inválidos");
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<String> manejarErrorInterno(Exception exception) {
		LogHelper.error(GlobalExceptionHandler.class, "Error interno al procesar la solicitud", null);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("No se pudo procesar la solicitud");
	}
}
