package com.grupo.tfc.conectapro.dto.agendamento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AgendarRequest(
        @NotNull
        UUID professorId,
        @NotNull
        OffsetDateTime dataHoraInicio,
        @NotBlank
        String modality,
        @NotBlank
        String subject
) {
}
