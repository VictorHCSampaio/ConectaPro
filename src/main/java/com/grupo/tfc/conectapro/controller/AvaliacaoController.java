package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.avaliacao.AvaliacaoRequest;
import com.grupo.tfc.conectapro.dto.avaliacao.AvaliacaoResponse;
import com.grupo.tfc.conectapro.service.AvaliacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponse> avaliar(@Valid @RequestBody AvaliacaoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(avaliacaoService.avaliar(request));
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<AvaliacaoResponse>> listarPorUsuario(@PathVariable UUID id) {
        return ResponseEntity.ok(avaliacaoService.listarPorAvaliado(id));
    }

    @GetMapping("/agendamento/{id}")
    public ResponseEntity<List<AvaliacaoResponse>> listarPorAgendamento(@PathVariable UUID id) {
        return ResponseEntity.ok(avaliacaoService.listarPorAgendamento(id));
    }
}
