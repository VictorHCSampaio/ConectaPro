package com.grupo.tfc.conectapro.dto.usuario;

import jakarta.validation.constraints.Size;

public record PerfilAlunoRequest(
        @Size(max = 1000, message = "Biografia deve ter no máximo 1000 caracteres")
        String biografia,
        String avatarUrl
) {
}
