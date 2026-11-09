package com.grupo.tfc.conectapro.dto.agendamento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AgendarRequest(
        @NotNull
        UUID professorId,
        @NotBlank
        String day,
        @NotBlank
        String time,
        @NotBlank
        String modality,
        @NotBlank
        String subject
) {
}
