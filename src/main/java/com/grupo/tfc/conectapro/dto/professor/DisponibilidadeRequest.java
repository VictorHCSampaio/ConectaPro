package com.grupo.tfc.conectapro.dto.professor;

import jakarta.validation.constraints.NotBlank;

public record DisponibilidadeRequest(
        @NotBlank
        String day,
        @NotBlank
        String time
) {
}
