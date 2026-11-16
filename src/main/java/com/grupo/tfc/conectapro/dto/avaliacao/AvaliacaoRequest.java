package com.grupo.tfc.conectapro.dto.avaliacao;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AvaliacaoRequest(
        @NotNull(message = "ID do avaliado é obrigatório")
        UUID avaliadoId,
        @NotNull(message = "ID do agendamento é obrigatório")
        UUID agendamentoId,
        @Min(value = 1, message = "Nota mínima é 1")
        @Max(value = 5, message = "Nota máxima é 5")
        int nota,
        @Size(max = 1000, message = "Comentário deve ter no máximo 1000 caracteres")
        String comentario
) {
}
