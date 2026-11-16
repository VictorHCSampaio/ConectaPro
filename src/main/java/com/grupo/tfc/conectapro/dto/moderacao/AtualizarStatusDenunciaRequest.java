package com.grupo.tfc.conectapro.dto.moderacao;

import com.grupo.tfc.conectapro.model.StatusDenuncia;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AtualizarStatusDenunciaRequest(
        @NotNull(message = "Status é obrigatório")
        StatusDenuncia status,
        @Size(max = 4000, message = "Notas de moderação devem ter no máximo 4000 caracteres")
        String notasModeracao
) {
}
