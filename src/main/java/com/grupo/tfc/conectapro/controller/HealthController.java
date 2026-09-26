package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.HealthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@RestController
@RequestMapping("/health")
public class HealthController {

    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);

    private static final int TIMEOUT_BANCO_SEGUNDOS = 3;

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<HealthResponse> verificar() {
        boolean bancoDisponivel = bancoDisponivel();

        HealthResponse corpo = new HealthResponse(
                bancoDisponivel ? "UP" : "DOWN",
                bancoDisponivel ? "UP" : "DOWN");

        return bancoDisponivel
                ? ResponseEntity.ok(corpo)
                : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(corpo);
    }

    private boolean bancoDisponivel() {
        try (Connection conexao = dataSource.getConnection()) {
            return conexao.isValid(TIMEOUT_BANCO_SEGUNDOS);
        } catch (SQLException exception) {
            logger.warn("Banco indisponivel no health check. motivo={}", exception.getMessage());
            return false;
        }
    }
}
