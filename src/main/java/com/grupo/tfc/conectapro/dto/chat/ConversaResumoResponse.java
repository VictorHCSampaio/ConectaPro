package com.grupo.tfc.conectapro.dto.chat;

import java.time.OffsetDateTime;

public record ConversaResumoResponse(
        ParticipanteChatResponse participante,
        String ultimaMensagem,
        OffsetDateTime dataEnvio,
        boolean enviadaPorMim,
        long naoLidas
) {
}
