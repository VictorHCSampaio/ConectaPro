package com.grupo.tfc.conectapro.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ProfessorDTO(
        UUID id,
        UUID usuarioId,
        String biografia,
        BigDecimal precoHoraParticular,
        BigDecimal precoHoraEscola,
        Boolean atendeOnline,
        Boolean atendePresencial,
        String cep,
        String endereco,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm,
        Boolean verificado
) {
}
