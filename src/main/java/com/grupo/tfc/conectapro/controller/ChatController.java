package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.chat.EnviarMensagemRequest;
import com.grupo.tfc.conectapro.dto.chat.MensagemResponse;
import com.grupo.tfc.conectapro.service.ChatService;
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
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/mensagens")
    public ResponseEntity<MensagemResponse> enviar(@Valid @RequestBody EnviarMensagemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.enviarMensagem(request));
    }

    @GetMapping("/mensagens/{outroUsuarioId}")
    public ResponseEntity<List<MensagemResponse>> historico(@PathVariable UUID outroUsuarioId) {
        return ResponseEntity.ok(chatService.obterHistoricoSeguro(outroUsuarioId));
    }
}
