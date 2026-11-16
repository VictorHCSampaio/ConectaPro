package com.grupo.tfc.conectapro.dto.avaliacao;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AvaliacaoResponse(
        UUID id,
        String avaliadorNome,
        String avaliadorAvatarUrl,
        int nota,
        String comentario,
        OffsetDateTime criadoEm
) {
}
