package com.grupo.tfc.conectapro.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("erro", ex.getReason() != null ? ex.getReason() : "Erro inesperado"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        throw ex;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getDefaultMessage())
                .findFirst()
                .orElse("Dados inválidos");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erro", mensagem));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        logger.error("Erro interno não tratado", ex);
        return ResponseEntity.internalServerError()
                .body(Map.of("erro", "Erro interno do servidor. Tente novamente mais tarde."));
    }
}
