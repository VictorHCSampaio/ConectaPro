package com.grupo.tfc.conectapro.dto.auth;

import java.util.UUID;

public record UsuarioAutenticadoResponse(
        UUID id,
        String nomeCompleto,
        String email,
        String tipo
) {
}
