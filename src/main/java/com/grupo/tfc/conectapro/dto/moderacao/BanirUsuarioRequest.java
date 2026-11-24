package com.grupo.tfc.conectapro.dto.moderacao;

import jakarta.validation.constraints.NotBlank;

public record BanirUsuarioRequest(
        @NotBlank(message = "O motivo do banimento é obrigatório")
        String motivo
) {
}
