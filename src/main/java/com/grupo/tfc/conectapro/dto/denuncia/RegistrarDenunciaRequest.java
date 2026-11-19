package com.grupo.tfc.conectapro.dto.denuncia;

import com.grupo.tfc.conectapro.model.MotivoDenuncia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record RegistrarDenunciaRequest(
        @NotNull(message = "ID do denunciado é obrigatório")
        UUID denunciadoId,
        @NotNull(message = "Motivo é obrigatório")
        MotivoDenuncia motivo,
        @NotBlank(message = "Descrição é obrigatória")
        @Size(min = 10, max = 4000, message = "Descrição deve ter entre 10 e 4000 caracteres")
        String descricao
) {
}
