package com.grupo.tfc.conectapro.dto.professor;

import jakarta.validation.constraints.NotBlank;

public record MateriaProfessorRequest(
        @NotBlank
        String name,
        String observation,
        String level
) {
}
