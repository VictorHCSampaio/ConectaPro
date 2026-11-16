package com.grupo.tfc.conectapro.dto.moderacao;

import jakarta.validation.constraints.NotNull;

public record AplicarTimeoutRequest(
        @NotNull(message = "Duração do timeout é obrigatória")
        Integer horas
) {
}
