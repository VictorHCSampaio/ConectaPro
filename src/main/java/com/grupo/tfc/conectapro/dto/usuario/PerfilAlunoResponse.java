package com.grupo.tfc.conectapro.dto.usuario;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PerfilAlunoResponse(
        UUID id,
        String nomeCompleto,
        String email,
        String tipo,
        String biografia,
        String avatarUrl,
        String cidade,
        String bairro,
        OffsetDateTime membroDesde,
        int totalAulasAgendadas,
        double rating,
        int totalAvaliacoes
) {
}
