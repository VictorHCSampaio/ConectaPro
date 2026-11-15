package com.grupo.tfc.conectapro.dto.chat;

import java.util.UUID;

// LGPD: so id, nome e avatar. email, senha e endereco nao passam daqui
public record ParticipanteChatResponse(
        UUID id,
        String nome,
        String avatarUrl
) {
}
