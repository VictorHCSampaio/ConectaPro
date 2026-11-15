package com.grupo.tfc.conectapro.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

// remetente nao entra no body. quem manda é o token
public record EnviarMensagemRequest(
        @NotNull(message = "Destinatário é obrigatório")
        UUID destinatarioId,
        @NotBlank(message = "Conteúdo da mensagem é obrigatório")
        @Size(max = 4000, message = "Mensagem deve ter no máximo 4000 caracteres")
        String conteudo
) {
}
