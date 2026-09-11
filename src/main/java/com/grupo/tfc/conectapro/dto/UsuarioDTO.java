package com.grupo.tfc.conectapro.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UsuarioDTO(
        UUID id,
        String nomeCompleto,
        String email,
        OffsetDateTime criadoEm
) {
}
