package com.grupo.tfc.conectapro.dto.denuncia;

import com.grupo.tfc.conectapro.dto.chat.ParticipanteChatResponse;
import com.grupo.tfc.conectapro.model.MotivoDenuncia;
import com.grupo.tfc.conectapro.model.StatusDenuncia;

import java.time.OffsetDateTime;
import java.util.UUID;

public record DenunciaResponse(
        UUID id,
        ParticipanteChatResponse denunciante,
        UUID denunciadoId,
        String denunciadoNome,
        String denunciadoAvatar,
        MotivoDenuncia motivo,
        String descricao,
        StatusDenuncia status,
        OffsetDateTime dataCriacao
) {
}
