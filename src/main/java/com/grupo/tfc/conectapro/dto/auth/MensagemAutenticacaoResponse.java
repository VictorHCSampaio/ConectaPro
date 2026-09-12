package com.grupo.tfc.conectapro.dto.auth;

import com.grupo.tfc.conectapro.model.TipoUsuario;

public record MensagemAutenticacaoResponse(
        String message,
        String nomeCompleto,
        TipoUsuario tipo,
        boolean isAdmin
) {
}
