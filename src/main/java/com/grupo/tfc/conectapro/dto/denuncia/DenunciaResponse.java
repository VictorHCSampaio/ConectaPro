package com.grupo.tfc.conectapro.dto.denuncia;

import com.grupo.tfc.conectapro.dto.chat.ParticipanteChatResponse;
import com.grupo.tfc.conectapro.model.MotivoDenuncia;
import com.grupo.tfc.conectapro.model.StatusDenuncia;

import java.time.OffsetDateTime;
import java.util.UUID;

// LGPD: denunciante e professor so com id, nome e avatar. professorId é o perfil, nao o user
public record DenunciaResponse(
        UUID id,
        ParticipanteChatResponse denunciante,
        UUID professorId,
        String professorNome,
        String professorAvatar,
        MotivoDenuncia motivo,
        String descricao,
        StatusDenuncia status,
        OffsetDateTime dataCriacao
) {
}
