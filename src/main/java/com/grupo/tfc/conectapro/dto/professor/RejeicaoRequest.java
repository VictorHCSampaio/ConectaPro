package com.grupo.tfc.conectapro.dto.professor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejeicaoRequest(
        @NotBlank(message = "Informe o motivo da rejeicao")
        @Size(min = 5, message = "O motivo deve ter no minimo 5 caracteres")
        String motivo
) {
}
