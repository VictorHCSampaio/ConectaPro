package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.notificacao.NotificacaoResponse;
import com.grupo.tfc.conectapro.service.NotificacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping
    public ResponseEntity<List<NotificacaoResponse>> listar() {
        return ResponseEntity.ok(notificacaoService.listarNotificacoesDoUsuario());
    }

    @PutMapping("/{id}/lida")
    public ResponseEntity<NotificacaoResponse> marcarComoLida(@PathVariable UUID id) {
        return ResponseEntity.ok(notificacaoService.marcarComoLida(id));
    }
}
