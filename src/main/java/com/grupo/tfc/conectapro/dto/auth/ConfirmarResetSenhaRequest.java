package com.grupo.tfc.conectapro.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmarResetSenhaRequest(
        @NotBlank(message = "Token é obrigatório")
        String token,
        @NotBlank(message = "Nova senha é obrigatória")
        @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
        String novaSenha
) {
}