package com.grupo.tfc.conectapro.dto.professor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JustificativaRequest(
        @NotBlank(message = "Informe a justificativa")
        @Size(min = 10, message = "A justificativa deve ter no minimo 10 caracteres")
        String justificativa
) {
}
