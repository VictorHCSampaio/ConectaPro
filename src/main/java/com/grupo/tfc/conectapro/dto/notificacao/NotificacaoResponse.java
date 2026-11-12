package com.grupo.tfc.conectapro.dto.notificacao;

import com.grupo.tfc.conectapro.model.TipoNotificacao;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificacaoResponse(
        UUID id,
        String titulo,
        String mensagem,
        boolean lida,
        OffsetDateTime dataCriacao,
        TipoNotificacao tipo
) {
}
