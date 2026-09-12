package com.grupo.tfc.conectapro.dto.professor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EnderecoProfessorRequest(
        @NotBlank
        @Pattern(regexp = "\\d{8}", message = "CEP deve ter 8 digitos")
        String cep,
        String street,
        String neighborhood,
        String city,
        String state
) {
}
