package com.grupo.tfc.conectapro.dto.chat;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MensagemResponse(
        UUID id,
        ParticipanteChatResponse remetente,
        ParticipanteChatResponse destinatario,
        String conteudo,
        boolean lida,
        OffsetDateTime dataEnvio
) {
}
