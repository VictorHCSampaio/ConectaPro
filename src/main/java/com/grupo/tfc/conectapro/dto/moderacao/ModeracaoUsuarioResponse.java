package com.grupo.tfc.conectapro.dto.moderacao;

import com.grupo.tfc.conectapro.model.StatusConta;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ModeracaoUsuarioResponse(
        UUID usuarioId,
        StatusConta statusConta,
        OffsetDateTime bloqueadoAte
) {
}
