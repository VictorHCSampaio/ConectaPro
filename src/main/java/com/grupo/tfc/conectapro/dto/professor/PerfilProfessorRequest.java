package com.grupo.tfc.conectapro.dto.professor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PerfilProfessorRequest(
        @NotBlank
        @Size(min = 3, message = "Nome deve ter no minimo 3 caracteres")
        String fullName,

        @NotBlank(message = "Telefone e obrigatorio")
        String phone,

        @NotBlank
        @Size(min = 50, message = "Biografia deve ter no minimo 50 caracteres")
        String bio,

        @NotNull
        @Size(min = 1, message = "Adicione ao menos uma materia")
        @Valid
        List<MateriaProfessorRequest> subjects,

        String teachingModel,

        @NotBlank(message = "Modalidade e obrigatoria")
        String modality,

        @NotNull
        @PositiveOrZero
        Double pricePerHour,

        @NotNull
        @Valid
        EnderecoProfessorRequest address,

        @Valid
        List<DisponibilidadeRequest> availability
) {
}
